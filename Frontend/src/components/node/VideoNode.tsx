import { type JSX } from 'react';
import type { LexicalNode, SerializedLexicalNode, NodeKey} from 'lexical';
import { DecoratorNode } from 'lexical';

type VideoSourceType = 'youtube' | 'generic';

interface VideoComponentProps {
  sourceType: VideoSourceType;
  src: string;
}

function VideoComponent({ sourceType, src }: VideoComponentProps): JSX.Element {
  if (sourceType === 'youtube') {
    // Renderiza o iframe do YouTube se a fonte for 'youtube'
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
        <iframe
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          src={`https://www.youtube.com/embed/${src}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
          title="YouTube video player"
        />
      </div>
    );
  } else {
    // Renderiza a tag <video> para outras fontes de URL
    return (
      <video
        controls
        src={src}
        style={{ maxWidth: '100%' }}
      />
    );
  }
}

export type SerializedVideoNode = SerializedLexicalNode & {
  type: 'video';
  version: 1;
  sourceType: VideoSourceType;
  src: string;
};

export class VideoNode extends DecoratorNode<JSX.Element> {
  __sourceType: VideoSourceType;
  __src: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__sourceType, node.__src, node.__key);
  }

  constructor(sourceType: VideoSourceType, src: string, key?: NodeKey) {
    super(key);
    this.__sourceType = sourceType;
    this.__src = src;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <VideoComponent sourceType={this.__sourceType} src={this.__src} />;
  }
  
  exportJSON(): SerializedVideoNode {
    return {
      type: 'video',
      version: 1,
      sourceType: this.__sourceType,
      src: this.__src,
    };
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    return $createVideoNode({
        sourceType: serializedNode.sourceType,
        src: serializedNode.src,
    });
  }
}

export interface CreateVideoNodePayload {
  sourceType: VideoSourceType;
  src: string;
}

export function $createVideoNode({ sourceType, src }: CreateVideoNodePayload): VideoNode {
  return new VideoNode(sourceType, src);
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}