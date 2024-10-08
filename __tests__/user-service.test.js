const { createUser, queryUserByUsername, queryEmail } = require('../src/repository/user-dao');
const { register } = require('../src/service/user-service');

jest.mock('../src/repository/user-dao', () => {
    const originalModule = jest.requireActual('../src/repository/user-dao');

    return {
        ...originalModule,
        queryUserByUsername: jest.fn(),
        queryEmail: jest.fn(),
        createUser: jest.fn(),
    }
});

describe('User Service Tests', () => {
    afterEach(() => {
        // clean up mock functions after each test
        queryUserByUsername.mockClear();
        queryEmail.mockClear();
    })

    test('register should return a 200 status code for a successful register', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);
        createUser.mockReturnValueOnce({
            '$metadata': {
              httpStatusCode: 200,
              requestId: 'DS9E6PBM40118SNLH55DC8GE0JVV4KQNSO5AEMVJF66Q9ASUAAJG',
              extendedRequestId: undefined,
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
        });

        const result = await register(mockRequestBody);

        expect(result).toHaveProperty('$metadata.httpStatusCode', 200);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should return a 200 status code for a successful register with a missing description', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david',
            email: 'david@gmail.com',
            description: null,
            picture: 'this is optional'
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);
        createUser.mockReturnValueOnce({
            '$metadata': {
              httpStatusCode: 200,
              requestId: 'DS9E6PBM40118SNLH55DC8GE0JVV4KQNSO5AEMVJF66Q9ASUAAJG',
              extendedRequestId: undefined,
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
        });

        const result = await register(mockRequestBody);

        expect(result).toHaveProperty('$metadata.httpStatusCode', 200);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should return a 200 status code for a successful register with a missing picture', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: null
        };

        queryUserByUsername.mockReturnValueOnce(false);
        queryEmail.mockReturnValueOnce(false);
        createUser.mockReturnValueOnce({
            '$metadata': {
              httpStatusCode: 200,
              requestId: 'DS9E6PBM40118SNLH55DC8GE0JVV4KQNSO5AEMVJF66Q9ASUAAJG',
              extendedRequestId: undefined,
              cfId: undefined,
              attempts: 1,
              totalRetryDelay: 0
            }
        });

        const result = await register(mockRequestBody);

        expect(result).toHaveProperty('$metadata.httpStatusCode', 200);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(queryEmail).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should throw an Error when trying to register without a username', async () => {
        const reqBody = {
            username: null,
            password: 'david123',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing username');
    });

    test('register should throw an Error when trying to register without a password', async () => {
        const reqBody = {
            username: 'david123',
            password: null,
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing password');
    });

    test('register should throw an Error when trying to register without an email', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david123',
            email: null,
            description: 'this can be null',
            picture: 'this is optional'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing email');
    });

    test('register should throw an Error when trying to register an already existing username', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        queryUserByUsername.mockReturnValueOnce({
            password: 'david',
            username: 'david123',
            email: 'david@gmail.com',
            creation_date: 1726686455,
            employee_id: '52caac7a-e48f-4587-9eac-c87422f4ba89'
        });

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('user with username already exists!');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
    });

    test('register should throw an Error when trying to register with an email that is already used', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david',
            email: 'david@gmail.com',
            description: 'this can be null',
            picture: 'this is optional'
        };

        queryEmail.mockReturnValueOnce({
            email: 'david@gmail.com',
            uuid: '04d196d1-7420-4da8-abd6-0e40aba3fd95'
        });

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('email used already');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
    });
});