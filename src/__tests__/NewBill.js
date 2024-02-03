/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }
  describe("When I am on NewBill Page", () => {
    let newBill;
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        email: 'employee@test.tld'
      }))
      
    })

    describe('Given a file input', () => {
      describe('When i use verifyTypeFile function with a file type GIF', () => {
        test('Then it should throw an error', () => {
          const expectedError = new TypeError('Incorrecte type file choose between jpeg, jpg, png');
         newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage});
      
          const result = newBill.verifyTypeFile({lastModified: 1676131169507,
            name: "58281349.gif",
            size: 310551,
            type: "image/gif",
            webkitRelativePath: ""})
           
            expect(result).toBeFalsy;
        })
      })
      describe('When i use verifyTypeFile function with a file type png', () => {
        test('Then it should give the object files initially given', () => {
          const expectedResult = {lastModified: 1676131169507,
          name: "58281349.png",
          size: 310551,
          type: "image/png",
          webkitRelativePath: ""}
          newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage});
          const res = newBill.verifyTypeFile(expectedResult)
          expect(res).toEqual(expectedResult);
          })
      })
      describe('When i use verifyTypeFile function with a file type jpeg', () => {
        test('Then it should give the object files initially given', () => {
          const expectedResult = {lastModified: 1676131169507,
          name: "58281349.png",
          size: 310551,
          type: "image/jpeg",
          webkitRelativePath: ""}
          newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage});
          const res = newBill.verifyTypeFile(expectedResult)
          expect(res).toEqual(expectedResult);
          })
      })
      describe('When i use verifyTypeFile function with a file type jpg', () => {
        test('Then it should give the object files initially given', () => {
          const expectedResult = {lastModified: 1676131169507,
          name: "58281349.png",
          size: 310551,
          type: "image/jpg",
          webkitRelativePath: ""}
          newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage});
          const res = newBill.verifyTypeFile(expectedResult)
          expect(res).toEqual(expectedResult);
          })
      })
    })
   
    test("Then i can create a new bill", async () => {
      const formDom = screen.getByTestId('form-new-bill');
      newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage});
      const stub = jest.fn((e) => newBill.handleSubmit(e))
      formDom.addEventListener('submit', stub);
      fireEvent.submit(formDom);
      expect(stub).toHaveBeenCalledTimes(1);
    })

    test('Then i choose a file in form, the input file value change', async () => {
      const file = screen.getByTestId('file');
      const ext = '.png';
      const name = 'image';
      const expectedResult = {fileUrl:'http://localhost:5678/'+name+ext, key: '1'}
      const expectedChange = {lastModified: 1676131169507,
        name: "58281349.png",
        size: 310551,
        type: "image/png",
        webkitRelativePath: ""}
      const bills = jest.fn();
      const create = jest.fn();
      bills.mockReturnValue({create});
      create.mockResolvedValue(expectedResult);
      newBill = new NewBill({document, onNavigate, store: {bills}, localStorage: window.localStorage});
      fireEvent.change(file, {target: {
        files:[expectedChange]
      }});
      console.log(file.text)
      expect(create).toBeCalledTimes(1);
      expect(create.mock.results[0].value).resolves.toEqual(expectedResult);
      expect(create).toHaveBeenCalledWith(create.mock.calls[0][0]);
    })

  
    // test('Then i choose one of these types of files png,jpg,jpeg it should return the object file', async () => {
    //   const expectedResult = {lastModified: 1676131169507,
    //     name: "58281349.png",
    //     size: 310551,
    //     type: "image/png",
    //     webkitRelativePath: ""}
    //     newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage});
    //     const res = await newBill.verifyTypeFile(expectedResult)
    //     expect(res).toEqual(expectedResult);
    // })

   

    test('Then file change failed for any reasons', async () => {
      const file = screen.getByTestId('file');
      const expectedError = new Error('Error occured on the server')
      const expectedChange = {lastModified: 1676131169507,
        name: "58281349.png",
        size: 310551,
        type: "image/png",
        webkitRelativePath: ""}
      const bills = jest.fn();
      const create = jest.fn();
      bills.mockReturnValue({create});
      create.mockRejectedValue(expectedError);
      newBill = new NewBill({document, onNavigate, store: {bills}, localStorage: window.localStorage});
      fireEvent.change(file, {target: {
        files:[expectedChange]
      }});
      expect(create).toBeCalledTimes(1);
      expect(create.mock.results[0].value).rejects.toEqual(expectedError);
      expect(create).toHaveBeenCalledWith(create.mock.calls[0][0]);
    })
  })
})
