import { PrismaClient } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();
export interface ResumeData {
    id?: number;
    candidateId?: number;
    filePath: string;
    fileType: string;
    uploadDate: Date;
}
export class Resume {
    id: number;
    candidateId: number;
    filePath: string;
    fileType: string;
    uploadDate: Date;

    constructor(data: any) {
        this.id = data?.id;
        this.candidateId = data?.candidateId;
        this.filePath = data?.filePath;
        this.fileType = data?.fileType;
        this.uploadDate = new Date();
    }

    async save(): Promise<Resume> {
        if (this.id) {
            try {
                const updatedResume = await prisma.resume.update({
                    where: { id: this.id },
                    data: this,
                });
                return new Resume(updatedResume);
            } catch (error: any) {  // Use `any` or a more specific type if known
                if ('code' in error && error.code === 'P2025') {
                    throw new Error('No se pudo encontrar el registro del resume con el ID proporcionado.');
                } else {
                    throw new Error('Unexpected error');
                }
            }
        } else {
            try {
                const createdResume = await prisma.resume.create({
                    data: this,
                });
                return new Resume(createdResume);
            } catch (error: any) {  // Use `any` or a more specific type if known
                if (error instanceof PrismaClientInitializationError) {
                    throw new Error('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
                } else {
                    throw new Error('Unexpected error');
                }
            }
        }
    }

    static async findOne(id: number): Promise<Resume | null> {
        const resumeData = await prisma.resume.findUnique({ where: { id } });
        if (!resumeData) return null;
        return new Resume(resumeData);
    }

    static async findAll(candidateId: number) {
        return prisma.resume.findMany({
            where: { candidateId }
        });
    }
}
