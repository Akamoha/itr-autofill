chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const autofillData = {
        gross_salary: "3012000",
        actual_hra_received: "1000000",
        actual_rent_paid: "360000",
        basic_salary: "1000000",
        professional_tax: "2400",
        ["80c_deductions"]: "150000",
        ["80c_policynumber"]: "0"
      };

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      const waitFor = async (selector, timeout = 10000) => {
        const pollInterval = 200;
        const maxTries = timeout / pollInterval;
        for (let i = 0; i < maxTries; i++) {
          const el = document.querySelector(selector);
          if (el) return el;
          await delay(pollInterval);
        }
        return null;
      };

      // === 1. GROSS TOTAL INCOME SECTION ===
      const gtiNav = Array.from(document.querySelectorAll("li")).find(li =>
        li.innerText.includes("Gross Total Income")
      );
      if (gtiNav) {
        gtiNav.click();
        await delay(1000);
      }

      const editBtn = await waitFor('button#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary_edit');
      if (editBtn) {
        editBtn.click();
        await delay(300);
      }

      const grossField = document.querySelector('input#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary\\.Salary');
      if (grossField) {
        grossField.value = autofillData.gross_salary;
        grossField.dispatchEvent(new Event("input", { bubbles: true }));
      }

      const panelHeader = Array.from(document.querySelectorAll('.mat-panel-title-wrapper mat-panel-title h2'))
        .find(h2 => h2.textContent.includes("House rent allowance"));
      if (panelHeader) {
        panelHeader.click();
        await delay(500);
      }

      const selectTrigger = document.querySelector('mat-select[id$="Placeofwork_select"] .mat-mdc-select-trigger');
      if (selectTrigger) {
        selectTrigger.click();
        await delay(300);
        const metroOption = document.evaluate(
          "//span[contains(text(), 'Metro')]/ancestor::mat-option",
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (metroOption) metroOption.click();
      }

      const fieldMap = {
        actual_hra_received: 'input#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary\\.ScheduleEA10_13A\\.ActlHRARecv',
        actual_rent_paid: 'input#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary\\.ScheduleEA10_13A\\.ActlRentPaid',
        basic_salary: 'input#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary\\.ScheduleEA10_13A\\.BasicSalary',
        salary_40_percent: 'input#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary\\.ScheduleEA10_13A\\.Sal40Or50Per',
        professional_tax: 'input#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary\\.ProfessionalTaxUs16iii'
      };

      for (const [key, selector] of Object.entries(fieldMap)) {
        if (key === "salary_40_percent") continue;
        const val = autofillData[key];
        if (!val) continue;
        const input = document.querySelector(selector);
        if (input) {
          input.value = val;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      const basic = parseFloat(autofillData.basic_salary);
      if (!isNaN(basic)) {
        const salInput = document.querySelector(fieldMap.salary_40_percent);
        if (salInput) {
          salInput.value = Math.round(basic * 0.4);
          salInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      const saveBtn = await waitFor('button#Gross_Total_Income\\.ITR1_IncomeDeductions\\.Income_From_Salary_save');
      if (saveBtn) {
        saveBtn.click();
        await delay(1000);
      }

      const confirmBtn = await waitFor('button#Gross_Total_Income_save');
      if (confirmBtn) {
        confirmBtn.click();
        await delay(2000); // Give time for transition to complete
      }

    }
  });
});
