import React, { useState } from 'react';
import { Button, InputGroup, FormControl, Spinner } from 'react-bootstrap';

// Define the types for the props
interface FileUploaderProps {
  onChange: (file: File) => void;
  onUpload: (data: any) => void; // You might want to define a more specific type for the data
}

const FileUploader: React.FC<FileUploaderProps> = ({ onChange, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileData, setFileData] = useState<any>(null); // Define a more specific type if possible
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFile(file);
      setFileName(file.name);
      onChange(file);
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('http://localhost:3010/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Error al subir archivo');
        }

        const fileData = await res.json();
        setFileData(fileData);
        onUpload(fileData);
      } catch (error) {
        console.error('Error al subir archivo:', error);
      } finally {
        setLoading(false); // Asegura que loading se establezca a false después de la operación
      }
    }
  };

  return (
    <div>
      <InputGroup className="mb-3">
        <FormControl
          type="file"
          onChange={handleFileChange}
          aria-label="File"
          aria-describedby="basic-addon2"
        />
        <Button variant="outline-secondary" onClick={handleFileUpload}>
          {loading ? (
            <Spinner animation="border" role="status" size="sm" />
          ) : (
            'Subir Archivo'
          )}
        </Button>
      </InputGroup>
      <p className="mb-0">Selected file: {fileName}</p>
      {fileData && (
        <p className="mt-2">
          Archivo subido con éxito
        </p>
      )}
    </div>
  );
};

export default FileUploader;
