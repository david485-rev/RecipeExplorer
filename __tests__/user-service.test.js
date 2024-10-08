const { createUser, queryUserByUsername, patchPassword} = require('../src/repository/user-dao');
const { register, passwordChange } = require('../src/service/user-service');
const { getItemByUuid } = require('../src/repository/general-dao');
const bcrypt = require("bcrypt");

jest.mock('../src/repository/user-dao', () => {
    const originalModule = jest.requireActual('../src/repository/user-dao');

    return {
        ...originalModule,
        queryUserByUsername: jest.fn(),
        createUser: jest.fn(),
        patchPassword: jest.fn(),
    }
});

jest.mock('../src/repository/general-dao', () => {
    const origin = jest.requireActual('../src/repository/general-dao');

    return {
        ...origin,
        getItemByUuid: jest.fn()
    }
})

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


});

describe('User Service, password test', () => {
    afterEach(() => {
        getItemByUuid.mockClear();
    })

    test('pasword should throw error if new password is empty', async() => {
        const reqBody = {
            password: 'rightPassword',
            newPassword:""
        }

        expect(async () => {
            await passwordChange(reqBody); 
        }).rejects.toThrow("New password can not be empty");
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    });

    test('password should throw error if typed password is not matched with a current password in database', async() => {
        const reqBody ={
            password: 'wrongPassword',
            newPassword: 'newPassowrd'
        };

        getItemByUuid.mockReturnValueOnce({
            password: 'rightpassword'
        });

        expect(async() => {
            await passwordChange(reqBody);
        }).rejects.toThrow("password is not correct");
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    })

    test('metadata should be return upon successful change of password', async() => {
        const encyptedPassword = await bcrypt.hash('rightPassword', 10);
        const reqBody = {
            password: 'rightPassword',
            newPassword: 'newPassword'
        }

        getItemByUuid.mockReturnValueOnce({
            password: encyptedPassword
        });

        const result = await passwordChange(reqBody);

        expect(result).not.toBe(null);
        expect(patchPassword).toHaveBeenCalledTimes(1);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    })
    
});