import React, { useState } from 'react';

const ViewPatient = () => {
  const [reportData] = useState({
    patient: {
      name: 'Mr. MD SAIDUR RAHAMAN',
      code: '17503319316',
      gender: 'Male',
      age: '76 Year',
      billNo: 'LAB102506190505'
    },
    doctor: {
      referredBy: 'A.CHOKRABORTY',
      receivedDate: '19-06-2025 04:47 PM',
      collectionAt: 'THYRO DIAGNOSTIC',
      reportDate: '19-06-2025 04:56 PM'
    },
    tests: [
      {
        category: 'HEMATOLOGY',
        title: 'Complete Blood Count (CBC)',
        results: [
          { test: 'Hemoglobin', result: '10.4', unit: 'g/dl', normal: 'Male: 12 to 17\nFemale: 11.6 to 15\nchildren: 14 to 18', abnormal: true },
          { test: 'Total RBC Count', result: '3.48', unit: 'mill/cmm', normal: '4.3-5.9', abnormal: true },
          { test: 'Total WBC Count', result: '9800', unit: '/cmm', normal: '4000-11000' },
          { test: 'Polymorphs', result: '75', unit: '%', normal: '40-70', abnormal: true },
          { test: 'Lymphocytes', result: '22', unit: '%', normal: '20-40' },
          { test: 'Monocytes', result: '01', unit: '%', normal: '2-8', abnormal: true },
          { test: 'Eosinophils', result: '02', unit: '%', normal: '2-6' },
          { test: 'Basophils', result: '00', unit: '%', normal: '0-2' },
          { test: 'Platelet Count', result: '324000', unit: '/Cmm', normal: '150000-4000000' },
          { test: 'Absolute Neutrophils', result: '6500', unit: '/cmm', normal: '2500-7000' },
          { test: 'Absolute Lymphocyte', result: '2400', unit: '/cmm', normal: '1000-4000' },
          { test: 'ESR', result: '34', unit: '/Hour', normal: '6-18', abnormal: true },
          { test: 'P.C.V', result: '32.0', unit: '%', normal: '35.5-38.6', abnormal: true },
          { test: 'M.C.V.', result: '87.0', unit: 'femtolitre', normal: '80-100' },
          { test: 'M.C.H.', result: '28.0', unit: 'pg', normal: '27-31' },
          { test: 'M.C.H.C.', result: '32.0', unit: 'g/dl', normal: '31-36' },
          { test: 'R.D.W.', result: '13.0', unit: '%', normal: '12-15' }
        ]
      },
      {
        category: 'BIOCHEMISTRY',
        title: 'LIVER FUNCTION TEST (LFT)',
        results: [
          { test: 'S. Bilirubin (Total)', result: '0.80', unit: 'mg/dl', normal: 'Up to -1.0' },
          { test: 'S. Bilirubin (Direct)', result: '0.20', unit: 'mg/dl', normal: 'Up to -0.20' },
          { test: 'S. Bilirubin (Indirect)', result: '0.60', unit: 'mg/dl', normal: 'Up to -0.80' },
          { test: 'S.G.O.T. (AST)', result: '15.1', unit: 'IU/L', normal: 'Adult - 0-35' },
          { test: 'S.G.P.T. (ALT)', result: '14.9', unit: 'U/L', normal: '>ADULT: 10-35' },
          { test: 'S. Alkaline Phosphatase', result: '48.0', unit: 'IU/L', normal: 'Adult: 25-140 IU/L' },
          { test: 'S. Proteins: (Total)', result: '6.10', unit: 'mg/dl', normal: '6.4-7.8 mg/dl', abnormal: true },
          { test: 'S. Albumin', result: '3.42', unit: 'mg/dl', normal: '3.5-5.2 mg/dl', abnormal: true },
          { test: 'S. Globulin', result: '2.68', unit: 'mg/dl', normal: '2.0-3.5 mg/dl' },
          { test: 'A/G Ratio', result: '1.28', unit: 'mg/dl', normal: '1.0-2.0' }
        ]
      },
      {
        category: 'BIOCHEMISTRY',
        title: 'LIPID PROFILE',
        results: [
          { test: 'Total Cholesterol', result: '113.0', unit: 'mg/dl', normal: '> 200', abnormal: true },
          { test: 'Triglycerides', result: '157.0', unit: 'mg/dl', normal: '>150', abnormal: true },
          { test: 'HDL Cholesterol', result: '72.0', unit: 'mg/dl', normal: '35 - 80' },
          { test: 'LDL Cholesterol', result: '35.0', unit: 'mg/dl', normal: '85 - 130', abnormal: true },
          { test: 'VLDL Cholesterol', result: '31.40', unit: 'mg/dl', normal: '5 - 40' },
          { test: 'LDL / HDL', result: '0.13', unit: 'mg/dl', normal: '1.5 - 3.5', abnormal: true },
          { test: 'Total Cholesterol / HDL', result: '1.57', unit: 'mg/dl', normal: '3.5 - 5', abnormal: true },
          { test: 'TG / HDL', result: '2.18', unit: 'mg/dl', normal: '3.1 - 6.0', abnormal: true },
          { test: 'Non-HDL cholesterol', result: '41.00', unit: 'mg/dl', normal: '130 - 159', abnormal: true }
        ]
      },
      {
        category: 'BIOCHEMISTRY',
        title: 'RENAL FUNCTION TEST (RFT)',
        results: [
          { test: 'Blood Urea', result: '62.0', unit: 'mg/dl', normal: '[15 - 40]', abnormal: true },
          { test: 'Serum Creatinine', result: '1.93', unit: 'mg/dl', normal: '>12year: 0.6–1.1', abnormal: true },
          { test: 'Uric Acid', result: '6.90', unit: 'mg/dl', normal: 'Adult: 3.5-7.2' },
          { test: 'Sodium', result: '136.0', unit: 'mEq/L', normal: '[135 to 145]' },
          { test: 'Potassium', result: '3.61', unit: 'mEq/L', normal: '>1Year: 3.5 to 5.1' },
          { test: 'Chlorides', result: '102.0', unit: 'mEq/L', normal: '[98 to 107]' }
        ]
      },
      {
        category: 'BIOCHEMISTRY',
        title: 'C-REACTIVE PROTEIN (CRP)',
        results: [
          { test: 'CRP (Turbidimetric Immunoassay)', result: '14.0', unit: 'mg/L', normal: 'UP TO 6.0', abnormal: true }
        ]
      },
      {
        category: 'BIOCHEMISTRY',
        title: 'SUGAR FASTING & PP',
        results: [
          { test: 'Fasting Blood Sugar (FBS)', result: '314', unit: 'mg/dl', normal: '70-110', abnormal: true },
          { test: 'Blood for PP', result: '442', unit: 'mg/dl', normal: '70-140', abnormal: true }
        ]
      }
    ]
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>THYRO DIAGNOSTIC</h1>
        <p style={styles.headerSubtitle}>Medical Laboratory Report</p>
      </div>

      {/* Patient and Doctor Details - Repeatable for each page */}
      {reportData.tests.map((testSection, index) => (
        <div key={index} style={styles.page}>
          {/* Patient Details */}
          <div style={styles.detailsSection}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Patient Name:</span>
                <span style={styles.value}>{reportData.patient.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Patient Code:</span>
                <span style={styles.value}>{reportData.patient.code}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Gender/Age:</span>
                <span style={styles.value}>{reportData.patient.gender} / {reportData.patient.age}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Bill No.:</span>
                <span style={styles.value}>{reportData.patient.billNo}</span>
              </div>
            </div>
          </div>

          {/* Doctor Details */}
          <div style={styles.detailsSection}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Referred by:</span>
                <span style={styles.value}>{reportData.doctor.referredBy}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Received Date:</span>
                <span style={styles.value}>{reportData.doctor.receivedDate}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Collection At:</span>
                <span style={styles.value}>{reportData.doctor.collectionAt}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Report Date:</span>
                <span style={styles.value}>{reportData.doctor.reportDate}</span>
              </div>
            </div>
          </div>

          {/* Test Category */}
          <div style={styles.categoryHeader}>
            {testSection.category}
          </div>

          {/* Test Title */}
          <div style={styles.testTitle}>
            {testSection.title}
          </div>

          {/* Results Table */}
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Test</th>
                <th style={styles.tableHeader}>Result</th>
                <th style={styles.tableHeader}>Unit</th>
                <th style={styles.tableHeader}>Normal Range</th>
              </tr>
            </thead>
            <tbody>
              {testSection.results.map((result, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.tableCell}>{result.test}</td>
                  <td style={{
                    ...styles.tableCell,
                    ...(result.abnormal ? styles.abnormalValue : {})
                  }}>
                    {result.result}
                  </td>
                  <td style={styles.tableCell}>{result.unit}</td>
                  <td style={styles.tableCell}>{result.normal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Page Break */}
          {index < reportData.tests.length - 1 && <div style={styles.pageBreak} />}
        </div>
      ))}

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>******** End of Report ********</p>
        <p style={styles.footerNote}>
          This is a computer-generated report and does not require a signature.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '210mm',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '20px',
    fontSize: '12px',
    color: '#333'
  },
  header: {
    textAlign: 'center',
    borderBottom: '3px solid #2c5aa0',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  headerTitle: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: '#2c5aa0',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  page: {
    marginBottom: '30px'
  },
  detailsSection: {
    marginBottom: '15px',
    border: '1px solid #ddd',
    padding: '10px',
    backgroundColor: '#f9f9f9'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  detailRow: {
    display: 'flex',
    gap: '10px'
  },
  label: {
    fontWeight: 'bold',
    minWidth: '120px',
    color: '#555'
  },
  value: {
    color: '#333'
  },
  categoryHeader: {
    backgroundColor: '#2c5aa0',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px'
  },
  testTitle: {
    backgroundColor: '#e8f0f8',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2c5aa0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '1px solid #ddd'
  },
  tableHeaderRow: {
    backgroundColor: '#4a7bc3'
  },
  tableHeader: {
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#fff',
    border: '1px solid #ddd',
    fontSize: '12px'
  },
  tableRow: {
    borderBottom: '1px solid #ddd'
  },
  tableCell: {
    padding: '8px',
    border: '1px solid #ddd',
    fontSize: '11px'
  },
  abnormalValue: {
    color: '#d32f2f',
    fontWeight: 'bold'
  },
  pageBreak: {
    borderTop: '2px dashed #ccc',
    marginTop: '30px',
    marginBottom: '30px'
  },
  footer: {
    textAlign: 'center',
    borderTop: '3px solid #2c5aa0',
    paddingTop: '15px',
    marginTop: '30px'
  },
  footerText: {
    margin: '10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c5aa0'
  },
  footerNote: {
    margin: '5px 0',
    fontSize: '10px',
    color: '#666',
    fontStyle: 'italic'
  }
};

export default ViewPatient;