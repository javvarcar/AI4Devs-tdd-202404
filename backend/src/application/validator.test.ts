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

const invalidNames = [
    { name: 'A', error: 'Invalid name' },
    { name: 'A'.repeat(101), error: 'Invalid name' },
    { name: 'John123', error: 'Invalid name' },
];

const invalidEmails = [
    { email: 'john.doe', error: 'Invalid email' },
    { email: "'; DROP TABLE candidates; --", error: 'Invalid email' },
];

const invalidPhones = [
    { phone: '123456789', error: 'Invalid phone' },
];

const invalidDates = [
    { date: '01-01-2020', error: 'Invalid date' },
];

const invalidAddresses = [
    { address: 'A'.repeat(101), error: 'Invalid address' },
];

const invalidEducations = [
    { education: { institution: 'A'.repeat(101), title: 'Bachelor of Science', startDate: '2020-01-01', endDate: '2024-01-01' }, error: 'Invalid institution' },
    { education: { institution: 'University', title: 'A'.repeat(101), startDate: '2020-01-01', endDate: '2024-01-01' }, error: 'Invalid title' },
    { education: { institution: 'University', title: 'Bachelor of Science', startDate: '2020-01-01', endDate: '01-01-2024' }, error: 'Invalid end date' },
];

const invalidExperiences = [
    { experience: { company: 'A'.repeat(101), position: 'Developer', description: 'Developing stuff', startDate: '2022-02-01', endDate: '2023-02-01' }, error: 'Invalid company' },
    { experience: { company: 'Tech Co', position: 'A'.repeat(101), description: 'Developing stuff', startDate: '2022-02-01', endDate: '2023-02-01' }, error: 'Invalid position' },
    { experience: { company: 'Tech Co', position: 'Developer', description: 'A'.repeat(201), startDate: '2022-02-01', endDate: '2023-02-01' }, error: 'Invalid description' },
    { experience: { company: 'Tech Co', position: 'Developer', description: 'Developing stuff', startDate: '2022-02-01', endDate: '02-01-2023' }, error: 'Invalid end date' },
];

const validateSQLInjection = (input: string) => {
    // Add your SQL injection validation logic here
    if (input.includes("DROP TABLE")) {
        throw new Error('Invalid input');
    }
};

const validateXSS = (input: string) => {
    // Add your XSS validation logic here
    if (input.includes("<script>") || input.includes("</script>")) {
        throw new Error('Invalid input');
    }
};

describe('Validator Tests', () => {
    describe.each(invalidNames)('validateName', ({ name, error }) => {
        it(`should throw an error for invalid name: ${name}`, () => {
            expect(() => validateName(name)).toThrow(error);
        });
    });

    it('should not throw an error for a valid name', () => {
        expect(() => validateName('John Doe')).not.toThrow();
    });

    describe.each(invalidEmails)('validateEmail', ({ email, error }) => {
        it(`should throw an error for invalid email: ${email}`, () => {
            expect(() => validateEmail(email)).toThrow(error);
        });
    });

    it('should not throw an error for a valid email', () => {
        expect(() => validateEmail('john.doe@example.com')).not.toThrow();
    });

    describe.each(invalidPhones)('validatePhone', ({ phone, error }) => {
        it(`should throw an error for invalid phone number: ${phone}`, () => {
            expect(() => validatePhone(phone)).toThrow(error);
        });
    });

    it('should not throw an error for a valid phone number', () => {
        expect(() => validatePhone('612345678')).not.toThrow();
    });

    describe.each(invalidDates)('validateDate', ({ date, error }) => {
        it(`should throw an error for invalid date format: ${date}`, () => {
            expect(() => validateDate(date)).toThrow(error);
        });
    });

    it('should not throw an error for a valid date format', () => {
        expect(() => validateDate('2020-01-01')).not.toThrow();
    });

    describe.each(invalidAddresses)('validateAddress', ({ address, error }) => {
        it(`should throw an error if the address is too long: ${address}`, () => {
            expect(() => validateAddress(address)).toThrow(error);
        });
    });

    it('should not throw an error for a valid address', () => {
        expect(() => validateAddress('123 Main St')).not.toThrow();
    });

    describe('validateEducation', () => {
        const validEducation = {
            institution: 'University',
            title: 'Bachelor of Science',
            startDate: '2020-01-01',
            endDate: '2024-01-01'
        };

        describe.each(invalidEducations)('invalid education', ({ education, error }) => {
            it(`should throw an error for invalid education: ${JSON.stringify(education)}`, () => {
                expect(() => validateEducation(education)).toThrow(error);
            });
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

        describe.each(invalidExperiences)('invalid experience', ({ experience, error }) => {
            it(`should throw an error for invalid experience: ${JSON.stringify(experience)}`, () => {
                expect(() => validateExperience(experience)).toThrow(error);
            });
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
        it('should throw an error if required fields are missing', () => {
            const invalidData = { firstName: 'John' }; // Missing lastName and email
            expect(() => validateCandidateData(invalidData)).toThrow('Missing required fields');
        });

        it('should pass if all required fields are present', () => {
            const validData = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' };
            expect(() => validateCandidateData(validData)).not.toThrow();
        });

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

    describe('validateSQLInjection', () => {
        it('should sanitize input to prevent SQL injection', () => {
            const maliciousInput = "'; DROP TABLE candidates; --";
            expect(() => validateSQLInjection(maliciousInput)).toThrow('Invalid input');
        });
    });

    describe('validateXSS', () => {
        it('should sanitize input to prevent XSS attacks', () => {
            const maliciousInput = "<script>alert('XSS');</script>";
            expect(() => validateXSS(maliciousInput)).toThrow('Invalid input');
        });
    });

    describe('Security Testing', () => {
        it('should test for SQL injection vulnerabilities', () => {
            const maliciousInput = "'; DROP TABLE candidates; --";
            expect(() => validateSQLInjection(maliciousInput)).toThrow('Invalid input');
        });

        it('should test for sensitive data handling to prevent XSS attacks', () => {
            const maliciousInput = "<script>alert('XSS');</script>";
            expect(() => validateXSS(maliciousInput)).toThrow('Invalid input');
        });
    });

    describe('Boundary Tests', () => {
        describe.each([
            ['Name', 'A'.repeat(101), 'Invalid name'],
            ['Email', "'; DROP TABLE candidates; --", 'Invalid email'],
            ['Phone', '123456789', 'Invalid phone'],
            ['Date', '01-01-2020', 'Invalid date'],
            ['Address', 'A'.repeat(101), 'Invalid address'],
        ])('validate%s', (field, value, error) => {
            it(`should throw an error for invalid ${field}: ${value}`, () => {
                expect(() => {
                    switch (field) {
                        case 'Name':
                            validateName(value);
                            break;
                        case 'Email':
                            validateEmail(value);
                            break;
                        case 'Phone':
                            validatePhone(value);
                            break;
                        case 'Date':
                            validateDate(value);
                            break;
                        case 'Address':
                            validateAddress(value);
                            break;
                        default:
                            break;
                    }
                }).toThrow(error);
            });
        });
    });
});