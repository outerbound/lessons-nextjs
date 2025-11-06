const TextRenderDialog = (title :string, text: string, onClose: () => void) => {
  return (
    <div className="fixed inset-0 flex  items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-4xl w-full relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          &#x2715; {/* Close button */}
        </button>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header py-4">
            <h2>{title}</h2>
          </div>
          <div className="modal-body" style={{maxHeight: '80vh', overflowY: "auto"}}>
            <pre>{text}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextRenderDialog;