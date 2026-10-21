$ErrorActionPreference = 'Stop'
try {
  Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
public static class OpenNotesCredentialVault {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  private struct Credential {
    public uint Flags, Type;
    public string TargetName, Comment;
    public long LastWritten;
    public uint CredentialBlobSize;
    public IntPtr CredentialBlob;
    public uint Persist, AttributeCount;
    public IntPtr Attributes;
    public string TargetAlias, UserName;
  }
  [DllImport("advapi32.dll", EntryPoint="CredReadW", CharSet=CharSet.Unicode, SetLastError=true)]
  private static extern bool ReadNative(string target, uint type, uint flags, out IntPtr credential);
  [DllImport("advapi32.dll", EntryPoint="CredWriteW", CharSet=CharSet.Unicode, SetLastError=true)]
  private static extern bool WriteNative(ref Credential credential, uint flags);
  [DllImport("advapi32.dll", EntryPoint="CredDeleteW", CharSet=CharSet.Unicode, SetLastError=true)]
  private static extern bool DeleteNative(string target, uint type, uint flags);
  [DllImport("advapi32.dll")] private static extern void CredFree(IntPtr credential);
  public static string Read(string target) {
    IntPtr pointer;
    if (!ReadNative(target, 1, 0, out pointer)) {
      int error = Marshal.GetLastWin32Error();
      if (error == 1168) return null;
      throw new Win32Exception(error);
    }
    try {
      Credential value = (Credential)Marshal.PtrToStructure(pointer, typeof(Credential));
      byte[] bytes = new byte[value.CredentialBlobSize];
      Marshal.Copy(value.CredentialBlob, bytes, 0, bytes.Length);
      try { return Encoding.UTF8.GetString(bytes); } finally { Array.Clear(bytes, 0, bytes.Length); }
    } finally { CredFree(pointer); }
  }
  public static void Write(string target, string value) {
    byte[] bytes = Encoding.UTF8.GetBytes(value);
    if (bytes.Length > 2560) throw new InvalidOperationException("Credential too large");
    IntPtr blob = Marshal.AllocHGlobal(bytes.Length);
    try {
      Marshal.Copy(bytes, 0, blob, bytes.Length);
      Credential credential = new Credential {
        Type = 1, TargetName = target, UserName = "Open Notes",
        CredentialBlobSize = (uint)bytes.Length, CredentialBlob = blob, Persist = 2
      };
      if (!WriteNative(ref credential, 0)) throw new Win32Exception(Marshal.GetLastWin32Error());
    } finally {
      Array.Clear(bytes, 0, bytes.Length);
      Marshal.Copy(bytes, 0, blob, bytes.Length);
      Marshal.FreeHGlobal(blob);
    }
  }
  public static void Delete(string target) {
    if (!DeleteNative(target, 1, 0) && Marshal.GetLastWin32Error() != 1168)
      throw new Win32Exception(Marshal.GetLastWin32Error());
  }
}
'@
  $inputRecord = [Console]::In.ReadToEnd() | ConvertFrom-Json
  if ($inputRecord.target -notmatch '^OpenNotes\.Dropbox\.[a-zA-Z0-9.-]+$') { throw 'Invalid target' }
  $value = $null
  switch ($inputRecord.operation) {
    'probe' {
      $probeTarget = 'OpenNotes.Dropbox.Probe.' + [Guid]::NewGuid().ToString('N')
      try {
        [OpenNotesCredentialVault]::Write($probeTarget, 'probe')
        if ([OpenNotesCredentialVault]::Read($probeTarget) -ne 'probe') { throw 'Probe failed' }
      } finally { [OpenNotesCredentialVault]::Delete($probeTarget) }
    }
    'read' { $value = [OpenNotesCredentialVault]::Read($inputRecord.target) }
    'write' { [OpenNotesCredentialVault]::Write($inputRecord.target, $inputRecord.value) }
    'delete' { [OpenNotesCredentialVault]::Delete($inputRecord.target) }
    default { throw 'Invalid operation' }
  }
  @{ value = $value } | ConvertTo-Json -Compress
} catch {
  # Never emit native exceptions, stdin, credential values or OAuth responses.
  [Console]::Error.WriteLine('Credential vault unavailable')
  exit 1
}
