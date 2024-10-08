const { createUser, queryUserByUsername, patchPassword, postProfile} = require('../src/repository/user-dao');
const { register, passwordChange, createProfile } = require('../src/service/user-service');
const { getItemByUuid } = require('../src/repository/general-dao');
const { getDatabaseItem } = require('../src/service/general-service');

const bcrypt = require("bcrypt");

jest.mock('../src/repository/user-dao', () => {
    const originalModule = jest.requireActual('../src/repository/user-dao');

    return {
        ...originalModule,
        queryUserByUsername: jest.fn(),
        createUser: jest.fn(),
        patchPassword: jest.fn(),
        postProfile: jest.fn()
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
            password: String(encyptedPassword)
        });

        const result = await passwordChange(reqBody);

        expect(result).not.toBe(null);
        expect(patchPassword).toHaveBeenCalledTimes(1);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);
    })
    
});

describe('User Service, profile test', () => {

    test('get profile should return every information except password and null', async() => {
        
        //null description and empty picture
        //should return as it is except password
        const token = {
            uuid: 'validUuid'
        }

        getItemByUuid.mockReturnValueOnce({
            uuid: 'ValidUuid',
            password: 'password',
            username: 'user1',
            email: 'user1@email.com',
            picture: "",
            description: null,

        });

        const expectResult = {
            uuid: 'ValidUuid',
            username: 'user1',
            email:'user1@email.com',
            picture: "",
            description: null,
        }

        const result = await getDatabaseItem(token.uuid);

        expect(result).toEqual(expectResult);
        expect(getItemByUuid).toHaveBeenCalledTimes(1);

    });

    test('sucessfully update profile upon providing all require information', async() => {
        
        const token = {
            uuid: "validUuid"
        }

        const reqBody = {
            email:"user1@email.com",
            description: "desciprtion",
            username: 'user1',
            picture: "www.picture.com"
        }


    })
    
    test('updating profile with empty email should throw error', async()=> {
        
        const token = {
            uuid: "validUuid"
        }

        const reqBody ={
            email:"",
            description: "desciprtion",
            username: 'user1',
            picture: "www.picture.com"
        }

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('missing email');

    })

    test("updating profile with empty username should throw error", async() => {

        const token = {
            uuid: "validUuid"
        }

        const reqBody ={
            email:"user1.email.com",
            description: "desciprtion",
            username: '',
            picture: "www.picture.com"
        }

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('missing username');
    })

    test("updating profile with already exiting username should throw error", async() => {
        
        const token = {
            uuid: "validUuid"
        }
        
        const reqBody = {
            email:"user1.email.com",
            description: "desciprtion",
            username: 'user1',
            picture: "www.picture.com"
        }

        const mockValue = {
            username:'user1',
            password:'hashedPasword',
            description: null,
            picture: null
        }

        queryUserByUsername.mockReturnValueOnce(mockValue);
        getDatabaseItem.mockReturnValueOnce({
            uuid: "validUuid",
            username:"user3"
        })

        expect(async() => {
            await createProfile(reqBody, token.uuid);
        }).rejects.toThrow('user with username already exists!');
        expect(queryUserByUsername).toHaveBeenCalledTimes(1);
        expect(postProfile).toHaveBeenCalledTimes(1);
        expect(getDatabaseItem).toHaveBeenCalledTimes(1);

    })
});