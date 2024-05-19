import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FileUploader from './FileUploader';

describe('FileUploader', () => {
    const mockOnChange = jest.fn() as jest.Mock<void, [File]>;
    const mockOnUpload = jest.fn() as jest.Mock<Promise<void>>;

    it('renders without crashing', () => {
        const { getByLabelText } = render(<FileUploader onChange={ mockOnChange } onUpload = { mockOnUpload } />);
        expect(getByLabelText(/file/i)).toBeInTheDocument();
    });

    it('handles file selection', () => {
        const { getByLabelText } = render(<FileUploader onChange={ mockOnChange } onUpload = { mockOnUpload } />);
        const fileInput = getByLabelText(/file/i) as HTMLInputElement;
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [testFile] } });

        expect(mockOnChange).toHaveBeenCalledWith(testFile);
    });

    it('handles file upload', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'File uploaded successfully' }),
            })
        ) as jest.Mock;

        const { getByText, getByLabelText } = render(<FileUploader onChange={ mockOnChange } onUpload = { mockOnUpload } />);
        const fileInput = getByLabelText(/file/i) as HTMLInputElement;
        const uploadButton = getByText(/subir archivo/i) as HTMLButtonElement;
        const testFile = new File(['test'], 'test.png', { type: 'image/png' });

        fireEvent.change(fileInput, { target: { files: [testFile] } });
        fireEvent.click(uploadButton);

        await waitFor(() => expect(mockOnUpload).toHaveBeenCalled());
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3010/upload', {
            method: 'POST',
            body: expect.any(FormData),
        });
    });
});


