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
  ElementFormatType, // Importante
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
  format?: ElementFormatType; // Payload aceita formato
}

export interface SerializedImageNode extends SerializedLexicalNode {
  altText: string;
  height?: number;
  maxWidth: number;
  src: string;
  width?: number;
  caption?: string;
  format?: ElementFormatType; // Serialização aceita formato
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
  __format: ElementFormatType; // Armazena o alinhamento

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
      node.__format, // Clona o formato atual
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
      format, // Recupera o formato salvo
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
      format: this.__format, // Salva o formato atual
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    caption?: string,
    format?: ElementFormatType, 
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
    this.__caption = caption || '';
    // Define 'center' como padrão se nenhum formato for passado
    this.__format = format || 'center'; 
  }

  // --- Setters e Getters ---

  setFormat(format: ElementFormatType): void {
    const writable = this.getWritable();
    writable.__format = format;
  }

  getFormat(): ElementFormatType {
    return this.__format;
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  getSrc(): string { return this.__src; }
  getAltText(): string { return this.__altText; }
  getCaption(): string { return this.__caption; }

  // Cria o elemento DOM wrapper.
  // É crucial que ele seja display: block para ocupar a linha toda.
  //@ts-ignore
  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'editor-image-wrapper'; // Classe opcional para CSS global
    element.style.display = 'block'; 
    element.style.width = '100%';
    return element;
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
          format={this.__format} // Passa o formato para o React
        />
      </Suspense>
    );
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 1000,
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