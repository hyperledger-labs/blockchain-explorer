export const rowsPerPageOptions = [5, 10, 25, 50, 100];
export const reg = new RegExp("^[0-9]{0,9}$");
export const rangeLimitOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
export const defaultRangeLimit = 10;
export const E001 = "Please enter From and To fields";
export const E002 = '"To" Block should be less than or equal to "From" Block';
export const E003 = `Maximum allowed No of Block(s) is ${
	rangeLimitOptions[rangeLimitOptions.length - 1]
}`;
export const E004 = limit =>
	`No of Block(s) is set to ${limit}. Increase it to search for higher range.`;
export const E005 = `Maximum allowed No of Block(s) is ${
	rangeLimitOptions[rangeLimitOptions.length - 1]
}. Set lower range for better performance.`;
export const E006 = "Total block count in ledger";
export const E007 = "Blocks available after purge/boot-time";
export const E008 = "Transactions available after purge/boot-time";
export const E009 = "Transactions available after purge/boot-time";
