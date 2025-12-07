import Editor from '@monaco-editor/react';

const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 14,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  wordWrap: 'on',
};

export default function CodeEditor({ value, language, onChange }) {
  return (
    <div className="code-editor">
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        options={EDITOR_OPTIONS}
        loading={<span className="text-muted">Loading editor...</span>}
      />
    </div>
  );
}
