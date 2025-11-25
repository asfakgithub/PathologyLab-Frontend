import React, { useState, useEffect } from 'react';
import "./model.css";
import apiClient from './src/services/apiClient';
import { endpoints } from './src/services/api';

function Model({ setOpenCreate, item }) {
    const [input, setInput] = useState({
        "name": item ? item.name : "",
        "age": item ? item.age : "",
        "address": item ? item.address : "",
        "mobileNo": item ? item.mobileNo : "",
        "examinedBy": item ? item.examinedBy : "",
        "reportDate": item ? item.reportDate : "",
        "test": item ? item.test : "",
        "examinedDate": item ? item.examinedDate : ""
    });
    const [listOfTest, setListOfTest] = useState([]);

    useEffect(() => {
        handleSelectOption();
    }, []);

    const handleSelectOption = async () => {
        try {
            const response = await apiClient.get(endpoints.tests.list);
            const tests = response?.data || response || [];

            // Ensure tests have both _id and name properties
            const formattedTests = tests.map(test => ({
                _id: test._id || test.id,  // Handle different ID fields
                name: test.name || test.testName || 'Unnamed Test'  // Fallback names
            }));

            setListOfTest(formattedTests);

            // Set initial test value
            if (!item && formattedTests.length > 0) {
                setInput(prev => ({ ...prev, test: formattedTests[0]._id }));
            }
        } catch (err) {
            console.log('API failed, using dummy data', err);

            // Fallback dummy data with proper structure
            const dummyTests = [
                { _id: '1', name: 'Blood Test' },
                { _id: '2', name: 'Urine Test' },
                { _id: '3', name: 'X-Ray' }
            ];

            setListOfTest(dummyTests);

            if (!item && dummyTests.length > 0) {
                setInput(prev => ({ ...prev, test: dummyTests[0]._id }));
            }
        }
    };

    // ... rest of your component code ...

    return (
        <div className='model'>
            <div className='model-card'>
                {/* ... other parts of your JSX ... */}
                
                <div className='inputRowModel'>
                    <div className='inputBox'>
                        <div className='input-label'>Test</div>
                        <select 
                            className='input-model' 
                            name='test' 
                            value={input.test} 
                            onChange={handleInputs}
                        >
                            {listOfTest.length > 0 ? (
                                listOfTest.map(test => (
                                    <option key={test._id} value={test._id}>
                                        {test.name}
                                    </option>
                                ))
                            ) : (
                                <option value="">No tests available</option>
                            )}
                        </select>
                    </div>
                    <div className='inputBox'>
                        <div className='input-label'>Report Date</div>
                        <input 
                            type='date' 
                            name='reportDate' 
                            className='input-model'
                            onChange={handleInputs} 
                            value={input.reportDate} 
                        />
                    </div>
                </div>

                {/* ... rest of your JSX ... */}
            </div>
        </div>
    );
}

export default Model;