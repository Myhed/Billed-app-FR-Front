/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import Bills from "../containers/Bills.js"
import { formatDate, formatStatus } from "../app/format.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      const isHighlighted = Array.from(windowIcon.classList).find((className) => className === 'active-icon');
      expect(isHighlighted).toBeTruthy;

    });

    test("Then icon eye on bills resume dashbord should be clickeable", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const billsInstance = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      root.innerHTML = BillsUI({ data: bills })
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
     const iconEyes = await waitFor(() => screen.getAllByTestId('icon-eye'));
      // const iconEyes = screen.getAllByTestId('icon-eye');
      const handleClickIconEyeStubs = iconEyes.slice()
        .map(iconEyes => jest.fn((e) => billsInstance.handleClickIconEye(iconEyes)))
        handleClickIconEyeStubs.forEach((handleClickIconEyeStub, index) => {
          iconEyes[index].addEventListener('click', handleClickIconEyeStub);
          fireEvent.click(iconEyes[index]);
        });
        handleClickIconEyeStubs.forEach(handleClickIconEyeStubs => {
          expect(handleClickIconEyeStubs).toHaveBeenCalled()
        });
    });
    
    test('Then create new bill should navigate on newBill Page', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const billsInstance = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // window.onNavigate(ROUTES_PATH.Bills)
      window.onNavigate(ROUTES_PATH.Bills);
      // await waitFor(() => screen.getByTestId('btn-new-bill'));
      const newBillButton = screen.getByTestId('btn-new-bill');
      const handleClickNewBillMock = jest.fn(() => billsInstance.handleClickNewBill());
      newBillButton.addEventListener('click', handleClickNewBillMock);
      fireEvent.click(newBillButton);

      expect(handleClickNewBillMock).toHaveBeenCalled();

    })

   

    describe('getBills', () => {
      let storeStub;
      let billsInstance;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      beforeAll(() => {
      storeStub = {
        bills: jest.fn()
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        billsInstance = new Bills({
          document, onNavigate, store: storeStub, bills:bills, localStorage: window.localStorage
        });
      });

      test('it should get all bills list with formated status and date', async () => {
        // GIVEN
        const expectedBills = bills.slice().map(bill => ({...bill, date: formatDate(bill.date), status: formatStatus(bill.status)}));
        const mockApiEntity = {
          list: jest.fn()
        }
        mockApiEntity.list.mockResolvedValue(bills);
        storeStub.bills.mockReturnValue(mockApiEntity)
        // WHEN
        const billsData = await billsInstance.getBills();
        expect(billsData).toEqual(expectedBills);
        // THEN
        expect(storeStub.bills).toHaveBeenCalled();
        expect(storeStub.bills()).toEqual(mockApiEntity);
        expect(mockApiEntity.list).toHaveBeenCalled();
        expect(mockApiEntity.list()).resolves.toEqual(bills);
      });
      test('it should catch an error and reject bills with no date formated', async () => {
        // GIVEN
        const corruptedDateBills = bills.slice().map(bill => ({...bill, date:'dawdawdaw', status: formatStatus(bill.status)}));
        const mockApiEntity = {
          list: jest.fn()
        }
        mockApiEntity.list.mockResolvedValue(corruptedDateBills);
        storeStub.bills.mockReturnValue(mockApiEntity)
        // WHEN
        try {
          await billsInstance.getBills();
        }catch(e){
          // THEN
          expect(e).rejects.toThrow(corruptedDateBills);
          expect(storeStub.bills).toHaveBeenCalled();
          expect(storeStub.bills()).toEqual(mockApiEntity);
          expect(mockApiEntity.list).toHaveBeenCalled();
          expect(mockApiEntity.list()).resolves.toEqual(corruptedDateBills);
        }
      });
      describe('No store', () => {
        let billsWithNoStore
        beforeAll(() => {
          billsWithNoStore = billsInstance = new Bills({
            document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
          }); 
        })
        test('it shouldnt return bills with no store', async () => {
          // GIVEN
          const expectedValue = undefined;
          // WHEN
          const billsData = await billsWithNoStore.getBills();
          // THEN
          expect(billsData).toEqual(expectedValue);
        })
      })
    })

    

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    });
  })
})
