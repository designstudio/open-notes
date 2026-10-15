import type { JSONContent } from '@tiptap/core';
export type Folder = { id: string; name: string; collectionId: string };
export type Note = { id: string; title: string; body: string; document?: JSONContent; collection: string; folder?: string; tags: string[]; favorite: boolean; archived: boolean; deleted: boolean; updated: number; icon: string; cover?: string; pageIcon?: string; subtitle?: string; showOutline?: boolean; pageWidth?: 'narrow' | 'wide' | 'full'; showCover?: boolean; showPageIcon?: boolean; showSubtitle?: boolean; coverGradient?: string; coverPosition?: number };
export type NoteDefaults = Pick<Note, 'showCover' | 'showPageIcon' | 'showSubtitle' | 'showOutline' | 'pageWidth'>;
export type Notebook = { id: string; name: string; color: string; description?: string; pinned?: boolean; archived?: boolean; createdAt?: number; noteDefaults?: NoteDefaults };
export type UserProfile = { name: string; photo: string };
export type AppData = { notes: Note[]; collections: Notebook[]; folders: Folder[]; profile?: UserProfile };
export const initialCollections: Notebook[] = [
  { id: 'pessoal', name: 'Pessoal', color: 'sage' },
  { id: 'trabalho', name: 'Trabalho', color: 'blue' },
  { id: 'ideias', name: 'Ideias & inspirações', color: 'amber' },
];
export const initialFolders: Folder[] = [
  { id: 'f-projetos', name: 'Projetos', collectionId: 'trabalho' },
  { id: 'f-reunioes', name: 'Reuniões', collectionId: 'trabalho' },
  { id: 'f-rotina', name: 'Rotina & Hábitos', collectionId: 'pessoal' },
  { id: 'f-leituras', name: 'Leituras', collectionId: 'ideias' },
];
const now = Date.now();
export const initialNotes: Note[] = [
  { id: '1', title: 'Um pouco menos, um pouco melhor', body: 'Um lembrete para os dias em que tudo parece urgente.\n\nNem toda ideia precisa virar um projeto. Nem todo espaço precisa ser preenchido.\n\n## O que quero levar comigo\n\n- Fazer uma coisa de cada vez.\n- Deixar espaço para mudar de ideia.\n- Valorizar o que já está aqui.\n\n> A clareza aparece quando a gente dá espaço.\n\nReservar alguns minutos no fim do dia para anotar o que realmente importou.', collection: 'pessoal', tags: ['reflexões'], favorite: true, archived: false, deleted: false, updated: now - 1200000, icon: 'leaf' },
  { id: '2', title: 'Ideias que merecem um café', body: 'Pensamentos soltos, pequenas curiosidades e coisas que quero explorar com mais calma.\n\n## E se…\n\n- Criássemos um clube de leitura sem metas?\n- Uma caminhada fosse parte do processo criativo?\n- O próximo projeto começasse com uma pergunta?\n\n## Para investigar\n\nUma biblioteca de referências visuais organizada por sensações, em vez de categorias.', collection: 'ideias', tags: ['ideias', 'criatividade'], favorite: true, archived: false, deleted: false, updated: now - 3600000, icon: 'coffee' },
  { id: '3', title: 'O próximo capítulo', body: 'Um lugar para desenhar os próximos passos — sem precisar ter todas as respostas.\n\n## Agora\n\n- [x] Organizar as referências do projeto\n- [ ] Desenhar a primeira versão\n- [ ] Conversar com quem vai usar\n\n## Depois\n\nTestar pequeno. Aprender rápido. Continuar com intenção.', collection: 'trabalho', folder: 'f-projetos', tags: ['planejamento'], favorite: true, archived: false, deleted: false, updated: now - 7200000, icon: 'compass' },
  { id: '4', title: 'Notas da reunião de produto', body: '## Pontos que discutimos\n\nUma experiência mais simples começa com escolhas mais claras.\n\n- Reduzir etapas no primeiro acesso.\n- Revisar os textos dos estados vazios.\n- Aproximar a pesquisa do processo de design.\n\n## Próximos passos\n\nPreparar um protótipo para a próxima conversa e reunir as dúvidas da equipe.', collection: 'trabalho', folder: 'f-reunioes', tags: ['reunião'], favorite: false, archived: false, deleted: false, updated: now - 10800000, icon: 'file' },
  { id: '5', title: 'Pequenas coisas para uma semana boa', body: '- [ ] Comprar flores para a mesa\n- [ ] Retomar o livro da cabeceira\n- [x] Encontrar um novo lugar para caminhar\n- [ ] Cozinhar algo sem receita\n\nÀs vezes, o plano é só prestar mais atenção.', collection: 'pessoal', folder: 'f-rotina', tags: ['cotidiano'], favorite: false, archived: false, deleted: false, updated: now - 86400000, icon: 'sun' },
  { id: '6', title: 'Referências para voltar depois', body: 'Uma coleção em construção.\n\n## Design\n\n- Interfaces que respeitam o tempo de quem usa.\n- Tipografia como ferramenta de clareza.\n- Produtos que fazem poucas coisas muito bem.\n\n## Leitura\n\nAnotar aqui os trechos que dão vontade de reler.', collection: 'ideias', folder: 'f-leituras', tags: ['referências'], favorite: false, archived: false, deleted: false, updated: now - 172800000, icon: 'book' },
  { id: '7', title: 'Uma pausa no meio do caminho', body: 'Sair um pouco da tela. Olhar pela janela. Anotar o que surge quando não estou procurando nada.\n\nHoje, a melhor ideia veio no caminho de volta.', collection: 'pessoal', tags: ['reflexões'], favorite: false, archived: false, deleted: false, updated: now - 259200000, icon: 'leaf' },
];
function calendarDaysSince(updated: Date, today: Date) {
  return Math.max(0, Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(updated.getFullYear(), updated.getMonth(), updated.getDate())) / 86400000));
}
export function relativeTime(time: number) {
  const days = calendarDaysSince(new Date(time), new Date());
  return days === 0 ? 'Hoje' : days === 1 ? 'Ontem' : `Há ${days} dias`;
}
export function noteListTime(time: number) {
  const today = new Date();
  const updated = new Date(time);
  if (calendarDaysSince(updated, today) <= 7) return relativeTime(time);
  return updated.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    ...(updated.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
}
export function excerpt(body: string) { return body.replace(/[#>*\[\]`_-]/g, '').replace(/\n+/g, ' ').trim(); }
