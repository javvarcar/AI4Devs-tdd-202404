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
    const testCases = [
        {
            description: 'should add a candidate successfully and return status 201 with a success message',
            requestBody: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
            mockResolvedValue: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
            expectedStatus: 201,
            expectedResponse: {
                message: 'Candidate added successfully',
                data: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
            },
        },
        {
            description: 'should handle errors when adding a candidate and return status 400 with an error message',
            requestBody: { firstName: 'John', email: 'invalid-email' },
            mockRejectedValue: new Error('Invalid email'),
            expectedStatus: 400,
            expectedResponse: {
                message: 'Error adding candidate',
                error: 'Invalid email',
            },
        },
        {
            description: 'should handle unknown errors and return status 400 with a generic error message',
            requestBody: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
            mockRejectedValue: {},
            expectedStatus: 400,
            expectedResponse: {
                message: 'Error adding candidate',
                error: 'Unknown error',
            },
        },
    ];

    testCases.forEach(({ description, requestBody, mockResolvedValue, mockRejectedValue, expectedStatus, expectedResponse }) => {
        it(description, async () => {
            const req = mockRequest(requestBody);
            const res = mockResponse();

            if (mockResolvedValue) {
                (addCandidate as jest.Mock).mockResolvedValue(mockResolvedValue);
            } else if (mockRejectedValue) {
                (addCandidate as jest.Mock).mockRejectedValue(mockRejectedValue);
            }

            await addCandidateController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(expectedStatus);
            expect(res.json).toHaveBeenCalledWith(expectedResponse);
        });
    });
});