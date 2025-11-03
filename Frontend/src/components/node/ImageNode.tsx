import { type JSX } from 'react';
import { 
  DecoratorNode, 
  $getNodeByKey, 
  type NodeKey, 
  type SerializedLexicalNode, 
  type EditorConfig, 
  type LexicalNode
} from 'lexical';
import ImageComponent from './ImageComponent'; // Importa o novo componente

/**
 * Define o formato esperado dos dados ao serializar/desserializar este nó.
 */
export type SerializedImageNode = SerializedLexicalNode & {
  altText: string;
  height: number | string;
  src: string;
  type: 'image';
  version: 1;
  width: number | string;
};

/**
 * Define o payload esperado pela função $createImageNode.
 */
export interface CreateImageNodePayload {
  src: string;
  altText: string;
  width?: string | number;
  height?: string | number;
  key?: NodeKey;
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width: string | number;
  __height: string | number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src, 
      node.__altText, 
      node.__width, 
      node.__height, 
      node.__key
    );
  }

  constructor(
    src: string, 
    altText: string, 
    width?: string | number, 
    height?: string | number, 
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
        src: serializedNode.src, 
        altText: serializedNode.altText,
        width: serializedNode.width,
        height: serializedNode.height,
    });
  }

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

isInline(): boolean {
    return false;
}

  setWidthAndHeight(width: string | number, height: string | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  // Métodos de acesso (getter) para propriedades privadas
  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createImageNode({ 
  src, 
  altText, 
  width, 
  height,
  key,
}: CreateImageNodePayload): ImageNode {
  return new ImageNode(src, altText, width, height, key);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}