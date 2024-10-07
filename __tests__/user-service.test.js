const { createUser, queryUserByUsername} = require('../src/repository/user-dao');
const { register } = require('../src/service/user-service');

jest.mock('../src/repository/user-dao', () => {
    const originalModule = jest.requireActual('../src/repository/user-dao');

    return {
        ...originalModule,
        queryUserByUsername: jest.fn(),
        createUser: jest.fn(),
    }
});

describe('User Service Tests', () => {
    afterEach(() => {
        // clean up mock functions after each test
        queryUserByUsername.mockClear();
    })

    test('register should return metadata on a successful register', async () => {
        const mockRequestBody = {
            username: 'david',
            password: 'david'
        };

        queryUserByUsername.mockReturnValueOnce(false);

        const result = await register(mockRequestBody);

        expect(result).not.toBe(null);
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledTimes(1);
    });

    test('register should throw an Error when trying to register without a username', async () => {
        const reqBody = {
            username: null,
            password: 'david123'
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing username');
    });

    test('register should throw an Error when trying to register without a password', async () => {
        const reqBody = {
            username: 'david123',
            password: null
        };

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('missing password');
    });

    test('register should throw an Error when trying to register an already existing username', async () => {
        const reqBody = {
            username: 'david123',
            password: 'david'
        };

        queryUserByUsername.mockReturnValueOnce({
            password: 'david',
            username: 'david123',
            join_date: 1726686455,
            employee_id: '52caac7a-e48f-4587-9eac-c87422f4ba89'
        });

        expect(async () => {
            await register(reqBody);
        }).rejects.toThrow('user with username already exists!');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
    });
    
});