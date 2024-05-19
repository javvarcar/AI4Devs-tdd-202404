import { Request, Response } from 'express';
import { addCandidate } from '../../application/services/candidateService';
import { addCandidateController } from './candidateController';

jest.mock('../../application/services/candidateService', () => ({
    addCandidate: jest.fn(),
}));

const mockRequest = (body: any): Partial<Request> => ({
    body,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('addCandidateController', () => {
    it('should add a candidate successfully and return status 201 with a success message', async () => {
        const req = mockRequest({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' });
        const res = mockResponse();

        (addCandidate as jest.Mock).mockResolvedValue({ id: 1, ...req.body });

        await addCandidateController(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Candidate added successfully',
            data: { id: 1, ...req.body },
        });
    });

    it('should handle errors when adding a candidate and return status 400 with an error message', async () => {
        const req = mockRequest({ firstName: 'John', email: 'invalid-email' }); // Invalid email
        const res = mockResponse();

        const error = new Error('Invalid email');
        (addCandidate as jest.Mock).mockRejectedValue(error);

        await addCandidateController(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error adding candidate',
            error: error.message,
        });
    });

    it('should handle unknown errors and return status 400 with a generic error message', async () => {
        const req = mockRequest({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' });
        const res = mockResponse();

        (addCandidate as jest.Mock).mockRejectedValue({}); // Unknown error type

        await addCandidateController(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error adding candidate',
            error: 'Unknown error',
        });
    });
});

