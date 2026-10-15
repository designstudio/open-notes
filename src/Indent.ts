import { Extension } from '@tiptap/core';

export const Indent = Extension.create({
  name: 'indent',
  addGlobalAttributes() {
    return [{ types: ['paragraph', 'heading'], attributes: { indent: {
      default: 0,
      parseHTML: element => Math.max(0, Math.min(6, Number(element.getAttribute('data-indent')) || 0)),
      renderHTML: attrs => attrs.indent ? { 'data-indent': attrs.indent, style: `padding-inline-start: ${attrs.indent * 1.5}em` } : {},
    } } }];
  },
});
