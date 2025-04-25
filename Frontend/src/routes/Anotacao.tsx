import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '../components/blocks/editor-x/editor.tsx';
import { SerializedEditorState } from 'lexical';
import { 
    ChevronDown, 
    ChevronUp, 
    House, 
    NotebookPen, 
    FileText, 
    UserRound, 
    Building2,
    BookOpen,
    Book
 } from 'lucide-react';
import "../assets/css/Anotacao.css";
import { Button } from '../components/ui/button.tsx';
import { set } from 'date-fns';

const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState;

function Anotacao() {
  const [editorState, setEditorState] = useState<SerializedEditorState>(initialValue);
  const [showTopBar, setShowTopBar] = useState(false);
  const [showClassificacao, setShowClassificacao] = useState(false);

  return (
    <>
      <div className='flex justify-center text-white mt-10'>
        <h1 className='text-3xl font-bold'>Anotações 123</h1>
      </div>
      <AnimatePresence>
  {showClassificacao && (
    <motion.div
      className="fixed top-0 left-0 w-full h-full bg-white z-50 p-6"
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-end">
          <div className='flex items-center justify-center group relative'>
        <Button 
          variant="ghost" 
          onClick={() => setShowClassificacao(false)}
        >
          <Book className='text-black' size={20} />
            <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-2 rounded opacity-0 group-hover:opacity-100 transition">
                Fechar <br /> Classificação
            </div>
        </Button>
        </div>
      </div>
      <div className="mt-6">
        <input 
          type="text" 
          placeholder="Digite algo..." 
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
      <AnimatePresence>
        {showTopBar && (
          <motion.div
            className="fixed top-0 left-0 w-full z-50"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex-1 h-30 rounded-b-2xl bg-foreground px-4 shadow-md max-w-2/3 mx-auto">
              <div className='flex justify-between pt-3 pb-3'>
                <div className='relative group flex items-center justify-center'>
                    <a href="/">
                    <House />
                    <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        Menu
                    </div>
                  </a>
                </div>
                <div className='relative group flex items-center justify-center'>
                  <a href="/anotacoes">
                    <NotebookPen />
                    <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        Anotações
                    </div>
                  </a>
                </div>
                <div className='relative group flex items-center justify-center'>
                  <FileText />
                  <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    Documentações
                  </div>
                </div>
                <div className='relative group flex items-center justify-center'>
                  <a href="/perfil">
                    <UserRound />
                    <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                        Perfil
                    </div>
                    </a>
                </div>
                <div className='relative group flex items-center justify-center'>
                    <a href="/setor">
                        <Building2 />
                        <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                            Setor
                        </div>
                    </a>
                </div>
              </div>
              <div className='flex pt-5 justify-between items-end'>
                <Button 
                variant={"secondary"} 
                className='ml-2 pt-3 pb-3'
                onClick={(e) => {
                    setShowClassificacao(true);
                    setShowTopBar(false);
                    e.stopPropagation();
                }}
                >
                    <div className='flex items-center justify-center group relative'>
                        <BookOpen className='text-white' size={20} />
                            <div className="absolute -bottom-6 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                            Abrir Classificação
                            </div>
                    </div>
                </Button>

                <div className='flex justify-end items-end'>
                    <Button variant={"destructive"} className='ml-2 pt-3 pb-3'>
                        <div className='flex items-center justify-center'>
                            <span className='text-white'>Cancelar</span>
                        </div>
                    </Button>
                    <Button variant={"secondary"} className='ml-2 pt-3 pb-3'>
                        <div className='flex items-center justify-center'>
                            <span className='text-white'>Salvar</span>
                        </div>
                    </Button>
                    <button
                    className="text-gray-700 hover:text-gray-900 pl-2 pb-1"
                    onClick={() => setShowTopBar(false)}
                    >
                    <ChevronUp className='text-black' size={20} />
                    </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="!w-2/3 mx-auto pt-12 relative z-0">
        {!showTopBar && (
            <div className="absolute top-0 right-0 z-50 mt-2">
            <button
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setShowTopBar(true)}
            >
                <ChevronDown className='text-white' size={20} />
            </button>
            </div>
        )}
        </div>

      <div className="!w-2/3 mx-auto pt-2 pb-2 relative z-0">
        <div className="editor-container">
          <Editor
            editorSerializedState={editorState}
            onSerializedChange={(value) => setEditorState(value)}
          />
        </div>
      </div>
    </>
  );
}

export default Anotacao;
