import { PrismaClient } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class WorkExperience {
    id?: number;
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    candidateId?: number;

    constructor(data: any) {
        this.id = data.id;
        this.company = data.company;
        this.position = data.position;
        this.description = data.description;
        this.startDate = new Date(data.startDate);
        this.endDate = data.endDate ? new Date(data.endDate) : undefined;
        this.candidateId = data.candidateId;
    }

    async save() {
        const workExperienceData: any = {
            company: this.company,
            position: this.position,
            description: this.description,
            startDate: this.startDate,
            endDate: this.endDate,
            candidateId: this.candidateId
        };

        if (this.id) {
            try {
                const updatedWorkExperience = await prisma.workExperience.update({
                    where: { id: this.id },
                    data: workExperienceData
                });
                return new WorkExperience(updatedWorkExperience);
            } catch (error: any) {
                if ('code' in error && error.code === 'P2025') {
                    throw new Error('No se pudo encontrar el registro de la experiencia laboral con el ID proporcionado.');
                } else {
                    throw new Error('Unexpected error');
                }
            }
        } else {
            try {
                const createdWorkExperience = await prisma.workExperience.create({
                    data: workExperienceData
                });
                return new WorkExperience(createdWorkExperience);
            } catch (error: any) {
                if (error instanceof PrismaClientInitializationError) {
                    throw new Error('No se pudo conectar con la base de datos. Por favor, asegúrese de que el servidor de base de datos esté en ejecución.');
                } else {
                    throw new Error('Unexpected error');
                }
            }
        }
    }

    static async findOne(id: number): Promise<WorkExperience | null> {
        const workExperienceData = await prisma.workExperience.findUnique({ where: { id } });
        if (!workExperienceData) return null;
        return new WorkExperience(workExperienceData);
    }
}
