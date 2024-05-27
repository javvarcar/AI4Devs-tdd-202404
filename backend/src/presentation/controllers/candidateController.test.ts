import { Request, Response } from 'express';
import { addCandidate, getCandidate } from '../../application/services/candidateService';
import { addCandidateController, getCandidateController } from './candidateController';
import * as candidateService from '../../application/services/candidateService';

jest.mock('../../application/services/candidateService', () => ({
    addCandidate: jest.fn(),
    getCandidate: jest.fn(),
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

describe('getCandidateController', () => {
    it('should get a candidate with educations, work experiences, and resumes', async () => {
        const req = {
            params: { id: '1' }
        };
        const res: any = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        const expectedCandidate = {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            educations: [{ id: 1, degree: 'BSc', institution: 'University' }],
            workExperience: [{ id: 1, company: 'Company', role: 'Developer' }],
            resumes: [{ id: 1, fileName: 'resume.pdf', fileContent: '...' }]
        };

        (candidateService.getCandidate as jest.Mock).mockResolvedValue(expectedCandidate);

        await getCandidateController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expectedCandidate);
    });

    it('should return 400 for an invalid candidate ID', async () => {
        const req: any = {
            params: { id: 'invalid' }
        };
        const res: any = {
            status: jest.fn(() => res),
            json: jest.fn()
        };

        await getCandidateController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid candidate ID' });
    });

    it('should return 404 when candidate is not found', async () => {
        const req: any = {
            params: { id: '123' }
        };
        const res: any = {
            status: jest.fn(() => res),
            json: jest.fn()
        };

        (candidateService.getCandidate as jest.Mock).mockResolvedValue(null);

        await getCandidateController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Candidate not found' });
    });

    it('should return 500 when there is a known error', async () => {
        const req: any = {
            params: { id: '1' }
        };
        const res: any = {
            status: jest.fn(() => res),
            json: jest.fn()
        };
        const error = new Error('Database error');

        (candidateService.getCandidate as jest.Mock).mockRejectedValue(error);

        await getCandidateController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving candidate', error: error.message });
    });

    it('should return 500 when there is an unknown error', async () => {
        const req: any = {
            params: { id: '1' }
        };
        const res: any = {
            status: jest.fn(() => res),
            json: jest.fn()
        };

        (candidateService.getCandidate as jest.Mock).mockRejectedValue({}); // Passing an empty object to simulate an unknown error

        await getCandidateController(req as any, res as any);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving candidate', error: 'Unknown error' });
    });
});
