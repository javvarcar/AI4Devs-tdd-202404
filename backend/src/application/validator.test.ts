import {
    validateName,
    validateEmail,
    validatePhone,
    validateDate,
    validateAddress,
    validateEducation,
    validateExperience,
    validateCV,
    validateCandidateData
} from './validator';

describe('Validator Tests', () => {
    describe('validateName', () => {
        it('should throw an error if the name is too short', () => {
            expect(() => validateName('A')).toThrow('Invalid name');
        });

        it('should throw an error if the name is too long', () => {
            const longName = 'A'.repeat(101);
            expect(() => validateName(longName)).toThrow('Invalid name');
        });

        it('should throw an error if the name contains invalid characters', () => {
            expect(() => validateName('John123')).toThrow('Invalid name');
        });

        it('should not throw an error for a valid name', () => {
            expect(() => validateName('John Doe')).not.toThrow();
        });
    });

    describe('validateEmail', () => {
        it('should throw an error for an invalid email', () => {
            expect(() => validateEmail('john.doe')).toThrow('Invalid email');
        });

        it('should not throw an error for a valid email', () => {
            expect(() => validateEmail('john.doe@example.com')).not.toThrow();
        });

        it('should prevent SQL injection in email', () => {
            const maliciousEmail = "'; DROP TABLE candidates; --";
            expect(() => validateEmail(maliciousEmail)).toThrow('Invalid email');
        });
    });

    describe('validatePhone', () => {
        it('should throw an error for an invalid phone number', () => {
            expect(() => validatePhone('123456789')).toThrow('Invalid phone');
        });

        it('should not throw an error for a valid phone number', () => {
            expect(() => validatePhone('612345678')).not.toThrow();
        });
    });

    describe('validateDate', () => {
        it('should throw an error for an invalid date format', () => {
            expect(() => validateDate('01-01-2020')).toThrow('Invalid date');
        });

        it('should not throw an error for a valid date format', () => {
            expect(() => validateDate('2020-01-01')).not.toThrow();
        });
    });

    describe('validateAddress', () => {
        it('should throw an error if the address is too long', () => {
            const longAddress = 'A'.repeat(101);
            expect(() => validateAddress(longAddress)).toThrow('Invalid address');
        });

        it('should not throw an error for a valid address', () => {
            expect(() => validateAddress('123 Main St')).not.toThrow();
        });
    });

    describe('validateEducation', () => {
        const validEducation = {
            institution: 'University',
            title: 'Bachelor of Science',
            startDate: '2020-01-01',
            endDate: '2024-01-01'
        };

        it('should throw an error if the institution is too long', () => {
            const invalidEducation = { ...validEducation, institution: 'A'.repeat(101) };
            expect(() => validateEducation(invalidEducation)).toThrow('Invalid institution');
        });

        it('should throw an error if the title is too long', () => {
            const invalidEducation = { ...validEducation, title: 'A'.repeat(101) };
            expect(() => validateEducation(invalidEducation)).toThrow('Invalid title');
        });

        it('should throw an error if the end date is invalid', () => {
            const invalidEducation = {
                institution: 'University',
                title: 'Bachelor of Science',
                startDate: '2020-01-01',
                endDate: '01-01-2024' // Formato incorrecto
            };
            expect(() => validateEducation(invalidEducation)).toThrow('Invalid end date');
        });

        it('should not throw an error for a valid education', () => {
            expect(() => validateEducation(validEducation)).not.toThrow();
        });
    });

    describe('validateExperience', () => {
        const validExperience = {
            company: 'Tech Co',
            position: 'Developer',
            description: 'Developing stuff',
            startDate: '2022-02-01',
            endDate: '2023-02-01'
        };

        it('should throw an error if the company name is too long', () => {
            const invalidExperience = { ...validExperience, company: 'A'.repeat(101) };
            expect(() => validateExperience(invalidExperience)).toThrow('Invalid company');
        });

        it('should throw an error if the position is too long', () => {
            const invalidExperience = { ...validExperience, position: 'A'.repeat(101) };
            expect(() => validateExperience(invalidExperience)).toThrow('Invalid position');
        });

        it('should throw an error if the description is too long', () => {
            const invalidExperience = { ...validExperience, description: 'A'.repeat(201) };
            expect(() => validateExperience(invalidExperience)).toThrow('Invalid description');
        });

        it('should throw an error if the end date is invalid', () => {
            const invalidExperience = {
                company: 'Tech Co',
                position: 'Developer',
                description: 'Developing stuff',
                startDate: '2022-02-01',
                endDate: '02-01-2023' // Formato incorrecto
            };
            expect(() => validateExperience(invalidExperience)).toThrow('Invalid end date');
        });

        it('should not throw an error for a valid experience', () => {
            expect(() => validateExperience(validExperience)).not.toThrow();
        });
    });

    describe('validateCV', () => {
        it('should throw an error if the CV is not an object', () => {
            expect(() => validateCV('Resume.pdf')).toThrow('Invalid CV');
        });

        it('should throw an error if the CV object is missing filePath', () => {
            expect(() => validateCV({ fileType: 'pdf' })).toThrow('Invalid CV');
        });

        it('should throw an error if the CV object is missing fileType', () => {
            expect(() => validateCV({ filePath: 'Resume.pdf' })).toThrow('Invalid CV');
        });

        it('should throw an error if filePath is not a string', () => {
            const cvData = { filePath: 123, fileType: 'pdf' };
            expect(() => validateCV(cvData)).toThrow('Invalid CV data');
        });

        it('should throw an error if fileType is not a string', () => {
            const cvData = { filePath: 'Resume.pdf', fileType: 123 };
            expect(() => validateCV(cvData)).toThrow('Invalid CV data');
        });

        it('should throw an error if both filePath and fileType are not strings', () => {
            const cvData = { filePath: 123, fileType: 123 };
            expect(() => validateCV(cvData)).toThrow('Invalid CV data');
        });

        it('should not throw an error for a valid CV', () => {
            expect(() => validateCV({ filePath: 'Resume.pdf', fileType: 'pdf' })).not.toThrow();
        });
    });

    describe('validateCandidateData', () => {
        it('should return early if an id is provided, indicating editing an existing candidate', () => {
            const candidateData = {
                id: 123,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St'
            };
            expect(() => validateCandidateData(candidateData)).not.toThrow();
        });

        it('should throw an error if firstName is invalid', () => {
            const candidateData = {
                firstName: 'A',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St'
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
        });

        it('should throw an error if lastName is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'D',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St'
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid name');
        });

        it('should throw an error if email is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe',
                phone: '612345678',
                address: '123 Main St'
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid email');
        });

        it('should throw an error if phone is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '123456789',
                address: '123 Main St'
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid phone');
        });

        it('should throw an error if address is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: 'A'.repeat(101)
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid address');
        });

        it('should throw an error if education is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St',
                educations: [{
                    institution: 'A'.repeat(101),
                    title: 'Bachelor of Science',
                    startDate: '2020-01-01',
                    endDate: '2024-01-01'
                }]
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid institution');
        });

        it('should throw an error if work experience is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St',
                workExperiences: [{
                    company: 'Tech Co',
                    position: 'Developer',
                    description: 'A'.repeat(201),
                    startDate: '2022-02-01',
                    endDate: '2023-02-01'
                }]
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid description');
        });

        it('should throw an error if CV is invalid', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St',
                cv: 'Resume.pdf'
            };
            expect(() => validateCandidateData(candidateData)).toThrow('Invalid CV data');
        });

        it('should not throw an error for valid candidate data', () => {
            const candidateData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '612345678',
                address: '123 Main St',
                educations: [{
                    institution: 'University',
                    title: 'Bachelor of Science',
                    startDate: '2020-01-01',
                    endDate: '2024-01-01'
                }],
                workExperiences: [{
                    company: 'Tech Co',
                    position: 'Developer',
                    description: 'Developing stuff',
                    startDate: '2022-02-01',
                    endDate: '2023-02-01'
                }],
                cv: { filePath: 'Resume.pdf', fileType: 'pdf' }
            };
            expect(() => validateCandidateData(candidateData)).not.toThrow();
        });
    });

    describe('Sanitization Tests', () => {
        it('should sanitize input to prevent SQL injection', () => {
            const maliciousInput = "'; DROP TABLE candidates; --";
            expect(() => validateName(maliciousInput)).toThrow('Invalid name');
        });

        it('should sanitize input to prevent XSS attacks', () => {
            const maliciousInput = "<script>alert('XSS');</script>";
            expect(() => validateName(maliciousInput)).toThrow('Invalid name');
        });
    });
});
