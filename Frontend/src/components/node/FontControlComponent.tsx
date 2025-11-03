import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useCallback, useEffect, useState, type JSX } from 'react';
import { $getSelection, $isRangeSelection, type EditorState } from 'lexical';
import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection';

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

interface SelectProps {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  className: string;
  options: [string, string][];
  value: string;
}

function Select({ onChange, className, options, value }: SelectProps): JSX.Element {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden={true} value="" />
      {options.map((option) => (
        <option key={option[0]} value={option[0]}>
          {option[1]}
        </option>
      ))}
    </select>
  );
}

export default function FontControls(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('12px');
  const [inputValue, setInputValue] = useState('');
  const [fontColor, setFontColor] = useState('#000000');

  useEffect(() => {
    const size = parseInt(fontSize, 10);
    setInputValue(isNaN(size) ? '' : size.toString());
  }, [fontSize]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000000')
      );
    }
  }, []);

  useEffect(() => {
    // Adiciona o tipo EditorState ao parâmetro
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const applyStyleText = useCallback(
    // Define o tipo do parâmetro 'styles'
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = (): void => {
    const newSize = inputValue ? `${inputValue}px` : '';
    applyStyleText({ 'font-size': newSize });
  };

  const onFontFamilySelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      applyStyleText({ 'font-family': e.target.value });
    },
    [applyStyleText],
  );

  const onFontColorSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setFontColor(newColor);
      applyStyleText({ color: newColor });
    },
    [applyStyleText],
  );

  return (
    <>
      <Select
        className="toolbar-item font-family"
        onChange={onFontFamilySelect}
        options={FONT_FAMILY_OPTIONS}
        value={fontFamily}
      />
      <input
        type="number"
        className="toolbar-item font-size"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
      />
      <div className="divider" />
      <input
        type="color"
        className="toolbar-item color-picker"
        value={fontColor}
        onChange={onFontColorSelect}
      />
    </>
  );
}