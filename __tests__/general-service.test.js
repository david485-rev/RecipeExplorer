const { getItemByUuid } = require("../src/repository/general-dao.js");
const generalService = require("../src/service/general-service.js");

jest.mock("../src/repository/general-dao.js", () => {
    const originalModule = jest.requireActual("../src/repository/general-dao.js");

    return {
        ...originalModule,
        getItemByUuid: jest.fn()
    }
});

describe("Testing getting an item with a valid uuid via generalService.getDatabaseItem", () =>{
    afterEach(() => {
        getItemByUuid.mockClear();
        getItemByUuid.mockReset();
    });

    test('getting with a valid uuid', async () => { 
        let result = null;
        const expectedResult = { uuid: "8", type: "user", username: "dave" };
        const uuid = "8";
        const dbItem = {uuid:"8", type:"user", username: "dave", password: "this is encrypted"};
        getItemByUuid.mockReturnValueOnce(dbItem);

        result = await generalService.getDatabaseItem(uuid);

        expect(result).toEqual(expectedResult);
        expect(getItemByUuid).toHaveBeenCalled()
    })

    test('getting with an invalid uuid', async () => {
        let result = null;
        const expectedError = "invalid uuid";
        const uuid = "8";
        const dbItem = null;
        
        getItemByUuid.mockReturnValueOnce(dbItem);
        
        expect(async () => {
            await generalService.getDatabaseItem(uuid);
        }).rejects.toThrow(expectedError);
    })

    test('getting with no uuid', async () => {
        let result = null;
        const expectedError = "missing uuid";
        const uuid = null;
        const dbItem = null;

        getItemByUuid.mockReturnValueOnce(dbItem);

        expect(async () => {
            await generalService.getDatabaseItem(uuid);
        }).rejects.toThrow(expectedError);
    })
})