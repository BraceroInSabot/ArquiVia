import type {
  //@ts-ignore
  DOMConversionMap,
  //@ts-ignore
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  //@ts-ignore
  Spread,
  ElementFormatType, // <-- Importe isso
} from 'lexical';
import { $applyNodeReplacement, DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';

const ImageComponent = React.lazy(() => import('./ImageComponent'));

export interface CreateImageNodePayload {
  altText: string;
  height?: number;
  maxWidth?: number;
  src: string;
  width?: number;
  key?: NodeKey;
  caption?: string;
  format?: ElementFormatType; // <-- Novo Campo
}

export interface SerializedImageNode extends SerializedLexicalNode {
  altText: string;
  height?: number;
  maxWidth: number;
  src: string;
  width?: number;
  caption?: string;
  format?: ElementFormatType; // <-- Novo Campo
  type: 'image';
  version: 1;
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;
  __maxWidth: number;
  __caption: string;
  __format: ElementFormatType; // <-- Propriedade da Classe

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__caption,
      node.__format, // <-- Clone
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, caption, src, format } = serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
      caption,
      format, // <-- Import
    });
    return node;
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
      caption: this.__caption,
      format: this.__format, // <-- Export
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    caption?: string,
    format?: ElementFormatType, // <-- Construtor
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
    this.__caption = caption || '';
    this.__format = format || 'center'; // Padrão: Centro (opcional, pode ser left)
  }

  // --- Getters e Setters ---

  getFormat(): ElementFormatType {
    return this.__format;
  }

  setFormat(format: ElementFormatType): void {
    const writable = this.getWritable();
    writable.__format = format;
  }

  getCaption(): string { return this.__caption; }
  
  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  
  getSrc(): string { return this.__src; }
  getAltText(): string { return this.__altText; }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          nodeKey={this.getKey()}
          caption={this.__caption}
          format={this.__format} // <-- Passa para o componente visual
        />
      </Suspense>
    );
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  caption,
  format,
}: CreateImageNodePayload): ImageNode {
  return $applyNodeReplacement(
    new ImageNode(src, altText, maxWidth, width, height, caption, format),
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}