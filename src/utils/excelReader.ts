import * as XLSX from 'xlsx';
import { DonationData, ExcelRow } from '../types';

export const readExcelFile = (file: File): Promise<DonationData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform to our format
        const donationData: DonationData = {};
        
        jsonData.forEach(row => {
          if (row.Year && row.Month && row['Donor Name'] && row['Donation Amount']) {
            const key = `${row.Year}-${row.Month}`;
            
            if (!donationData[key]) {
              donationData[key] = [];
            }
            
            donationData[key].push({
              name: row['Donor Name'],
              amount: row['Donation Amount']
            });
          }
        });
        
        resolve(donationData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const downloadExcelTemplate = () => {
  const templateData = [
    { Year: 2024, Month: 'January', 'Donor Name': 'John Smith', 'Donation Amount': 100 },
    { Year: 2024, Month: 'January', 'Donor Name': 'Sarah Johnson', 'Donation Amount': 250 },
    { Year: 2024, Month: 'February', 'Donor Name': 'Mike Davis', 'Donation Amount': 150 },
    { Year: 2023, Month: 'December', 'Donor Name': 'Emily Brown', 'Donation Amount': 300 },
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
  
  XLSX.writeFile(workbook, 'donations_template.xlsx');
};