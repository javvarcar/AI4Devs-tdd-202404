import { PrismaClient } from '@prisma/client';
import { Candidate } from './Candidate';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

describe('Candidate Model', () => {
    describe('save method', () => {
        const candidateData = [
            { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
            { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }
        ];

        it.each(candidateData)('should update an existing candidate with id %s', async (data) => {
            const candidate = new Candidate(data);

            (prisma.candidate.update as jest.Mock).mockResolvedValue({
                ...data,
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [],
                resumes: []
            });

            const result = await candidate.save();
            const { email, ...expectedData } = data; // Exclude email from expected data
            expect(result).toEqual({
                ...expectedData,
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [],
                resumes: []
            });
            expect(prisma.candidate.update).toHaveBeenCalledWith({
                where: { id: data.id },
                data: expect.any(Object)
            });
        });

        it.each(candidateData)('should throw an error if candidate record not found on update with id %s', async (data) => {
            const candidate = new Candidate({ ...data, id: 999 });

            (prisma.candidate.update as jest.Mock).mockRejectedValue({ code: 'P2025' });

            await expect(candidate.save()).rejects.toThrow('No se pudo encontrar el registro del candidato con el ID proporcionado.');
        });

        it('should handle other errors on update', async () => {
            const candidate = new Candidate({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new Error('Unexpected error');
            (prisma.candidate.update as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle other errors on create', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new Error('Unexpected error');
            (prisma.candidate.create as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle database connection errors on update', async () => {
            const candidate = new Candidate({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new PrismaClientInitializationError('Database connection error', 'P1001', '2.30.3');
            (prisma.candidate.update as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
        });

        it('should handle database connection errors on create', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new PrismaClientInitializationError('Database connection error', 'P1001', '2.30.3');
            (prisma.candidate.create as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
        });

        it('should handle unexpected errors on create', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new Error('Unexpected error');
            (prisma.candidate.create as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('Unexpected error');
        });

        it('should handle general errors on update', async () => {
            const candidate = new Candidate({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new Error('General error');
            (prisma.candidate.update as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('General error');
        });

        it('should handle general errors on create', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            const error = new Error('General error');
            (prisma.candidate.create as jest.Mock).mockRejectedValue(error);

            await expect(candidate.save()).rejects.toThrow('General error');
        });

        it('should create a new candidate successfully', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [],
                resumes: []
            });

            const result = await candidate.save();
            expect(result).toEqual({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [],
                resumes: []
            });
        });

        it('should add educations to a new candidate', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                education: [
                    {
                        institution: 'University A',
                        title: 'Bachelor of Science',
                        startDate: new Date('2010-01-01'),
                        endDate: new Date('2014-01-01')
                    }
                ]
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 3,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [
                    {
                        institution: 'University A',
                        title: 'Bachelor of Science',
                        startDate: new Date('2010-01-01'),
                        endDate: new Date('2014-01-01')
                    }
                ],
                workExperience: [],
                resumes: []
            });

            const result = await candidate.save();
            expect(result).toEqual({
                id: 3,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [
                    {
                        institution: 'University A',
                        title: 'Bachelor of Science',
                        startDate: new Date('2010-01-01'),
                        endDate: new Date('2014-01-01')
                    }
                ],
                workExperience: [],
                resumes: []
            });
        });

        it('should add work experiences to a new candidate', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                workExperience: [
                    {
                        company: 'Company X',
                        position: 'Developer',
                        description: 'Development work',
                        startDate: new Date('2015-01-01'),
                        endDate: new Date('2019-01-01')
                    }
                ]
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 4,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [
                    {
                        company: 'Company X',
                        position: 'Developer',
                        description: 'Development work',
                        startDate: new Date('2015-01-01'),
                        endDate: new Date('2019-01-01')
                    }
                ],
                resumes: []
            });

            const result = await candidate.save();
            expect(result).toEqual({
                id: 4,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [
                    {
                        company: 'Company X',
                        position: 'Developer',
                        description: 'Development work',
                        startDate: new Date('2015-01-01'),
                        endDate: new Date('2019-01-01')
                    }
                ],
                resumes: []
            });
        });

        it('should add resumes to a new candidate', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                resumes: [
                    {
                        filePath: 'resume1.pdf',
                        fileType: 'pdf'
                    }
                ]
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 5,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [],
                resumes: [
                    {
                        filePath: 'resume1.pdf',
                        fileType: 'pdf'
                    }
                ]
            });

            const result = await candidate.save();
            expect(result).toEqual({
                id: 5,
                firstName: 'John',
                lastName: 'Doe',
                phone: undefined,
                address: undefined,
                education: [],
                workExperience: [],
                resumes: [
                    {
                        filePath: 'resume1.pdf',
                        fileType: 'pdf'
                    }
                ]
            });
        });

        it('should add phone to candidate data when defined', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 1,
                ...candidate
            });

            const result = await candidate.save();
            expect(result).toEqual(expect.objectContaining({
                phone: '123-456-7890'
            }));
        });

        it('should not add phone to candidate data when undefined', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
                // phone is not provided
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 1,
                ...candidate,
                phone: undefined  // Ensure the mock reflects the absence of the phone
            });

            const result = await candidate.save();
            expect(result.phone).toBeUndefined();
        });

        it('should add address to candidate data when defined', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                address: '123 Main St'
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 1,
                ...candidate
            });

            const result = await candidate.save();
            expect(result).toEqual(expect.objectContaining({
                address: '123 Main St'
            }));
        });

        it('should not add address to candidate data when undefined', async () => {
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
                // address is not provided
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 1,
                ...candidate,
                address: undefined  // Ensure the mock reflects the absence of the address
            });

            const result = await candidate.save();
            expect(result.address).toBeUndefined();
        });
    });

    describe('findOne method', () => {
        const candidateIds = [999, 1, -1];

        it.each(candidateIds)('should return null if candidate not found with id %s', async (id) => {
            (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await Candidate.findOne(id);

            expect(result).toBeNull();
        });

        it.each(candidateIds)('should return a candidate instance if found with id %s', async (id) => {
            const candidateData = {
                id: id,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            };
            (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(candidateData);

            const result = await Candidate.findOne(id);

            expect(result).toBeInstanceOf(Candidate);
            expect(result?.id).toEqual(id);
        });
    });

    describe('Security Tests', () => {
        it('should not expose email in responses', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '123-456-7890',
                address: '123 Main St'
            });

            (prisma.candidate.create as jest.Mock).mockResolvedValue({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                phone: '123-456-7890',
                address: '123 Main St',
                email: 'john.doe@example.com' // Mocked response includes email
            });

            // Act
            const result = await candidate.save();

            // Assert
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                phone: '123-456-7890',
                address: '123 Main St'
            }));
            expect(result).not.toHaveProperty('email');
        });

        it('should handle email securely in logs', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '123-456-7890',
                address: '123 Main St'
            });

            const logSpy = jest.spyOn(console, 'log');
            await candidate.save();
            expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('john.doe@example.com'));
            logSpy.mockRestore();
        });
    });

    describe('Data Integrity Tests', () => {
        it('should throw an error if email is not unique', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
            });

            (prisma.candidate.create as jest.Mock).mockRejectedValue({
                code: 'P2002', // Unique constraint failed
                meta: { target: ['email'] }
            });

            // Act & Assert
            await expect(candidate.save()).rejects.toThrow('Unique constraint failed on the fields: (email)');
        });

        it('should throw an error if foreign key constraint is violated', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                resumes: [
                    {
                        filePath: 'resume1.pdf',
                        fileType: 'pdf',
                        candidateId: 999 // Assuming this candidateId does not exist
                    }
                ]
            });

            (prisma.candidate.create as jest.Mock).mockRejectedValue({
                code: 'P2003', // Foreign key constraint failed
                meta: { field_name: 'Resume_candidateId_fkey (index)' }
            });

            // Act & Assert
            await expect(candidate.save()).rejects.toThrow('Foreign key constraint failed on the field: Resume_candidateId_fkey (index)');
        });
    });
});
