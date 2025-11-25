import React, { useState, useEffect } from 'react';
import './model.css';
import apiClient from '../../services/apiClient';
import { endpoints } from '../../services/api';

function Model({ setOpenCreate, item }) {
    const [input, setInput] = useState({
        name: item ? item.name : "",
        age: item ? item.age : "",
        address: item ? item.address : "",
        mobileNo: item ? item.mobileNo : "",
        examinedBy: item ? item.examinedBy : "",
        reportDate: item ? item.reportDate : "",
        test: item ? item.test : "",
        examinedDate: item ? item.examinedDate : ""
    });

    const dummyTestData = [
        { _id: 1, name: "Blood Test" },
        { _id: 2, name: "Urine Test" },
        { _id: 3, name: "Thyroid Test" },
    ];

    const [listOfTest, setListOfTest] = useState([]);

    useEffect(() => {
        handleSelectOption();
    }, []);

    const handleSelectOption = async () => {
        try {
            const response = await apiClient.get(endpoints.tests.list);
            // apiClient returns response.data (server payload). Many endpoints return { data: [...] }
            const dataOne = response?.data?.length > 0 ? response.data : dummyTestData;

            setListOfTest(dataOne);

            setInput(prev => ({
                ...prev,
                test: item ? item.test : dataOne[0].name
            }));
        } catch (err) {
            console.log(err);
            // Fallback to dummy test list
            setListOfTest(dummyTestData);
            setInput(prev => ({
                ...prev,
                test: item ? item.test : dummyTestData[0].name
            }));
        }
    };

    const handleInputs = (event) => {
        setInput({ ...input, [event.target.name]: event.target.value });
    };

    const handleCreateNew = async () => {
        if (!item) {
            try {
                const resp = await apiClient.post(endpoints.patients.create, input);
                const dataOne = resp?.data || resp;
                setListOfTest(Array.isArray(dataOne) ? dataOne : Object.values(dataOne));
                window.location.reload();
            } catch (err) {
                alert('Please fill every Details');
                console.log('err : ', err);
            }
        } else {
            try {
                await apiClient.put(endpoints.patients.update(item._id), input);
                window.location.reload();
            } catch (err) {
                alert('Something Went Wrong');
                console.log(err);
            }
        }
    };

    return (
        <div className='model'>
            <div className='model-card'>
                <div className='model-titleBox'>
                    <div className='model-title'>{item ? "Update Patient" : "Create New"}</div>
                    <div className="x-btn" onClick={() => setOpenCreate(prev => !prev)}>X</div>
                </div>

                <div className='model-body'>
                    <div className='inputRowModel'>
                        <div className='inputBox'>
                            <div className='input-label'>Name</div>
                            <input
                                type='text'
                                name='name'
                                value={input.name}
                                onChange={handleInputs}
                                className='input-model'
                                placeholder='Enter a name'
                            />
                        </div>
                        <div className='inputBox'>
                            <div className='input-label'>Age</div>
                            <input
                                type='text'
                                name='age'
                                value={input.age}
                                onChange={handleInputs}
                                className='input-model'
                                placeholder='Enter Age'
                            />
                        </div>
                    </div>

                    <div className='inputRowModel'>
                        <div className='inputBox'>
                            <div className='input-label'>Address</div>
                            <input
                                type='text'
                                name='address'
                                value={input.address}
                                onChange={handleInputs}
                                className='input-model'
                                placeholder='Enter Address'
                            />
                        </div>
                        <div className='inputBox'>
                            <div className='input-label'>Mobile</div>
                            <input
                                type='text'
                                name='mobileNo'
                                value={input.mobileNo}
                                onChange={handleInputs}
                                className='input-model'
                                placeholder='Enter Mobile No'
                            />
                        </div>
                    </div>

                    <div className='inputRowModel'>
                        <div className='inputBox'>
                            <div className='input-label'>Examined By</div>
                            <input
                                type='text'
                                name='examinedBy'
                                value={input.examinedBy}
                                onChange={handleInputs}
                                className='input-model'
                                placeholder='Examined By'
                            />
                        </div>
                        <div className='inputBox'>
                            <div className='input-label'>Examined Date</div>
                            <input
                                type='date'
                                name='examinedDate'
                                value={input.examinedDate}
                                onChange={handleInputs}
                                className='input-model'
                                placeholder='Examined Date'
                            />
                        </div>
                    </div>

                    <div className='inputRowModel'>
                        <div className='inputBox'>
                            <div className='input-label'>Selected Test</div>
                            <select
                                className='input-model'
                                name='test'
                                value={input.test}
                                onChange={handleInputs}
                            >
                                {listOfTest.map((testItem) => (
                                    <option key={testItem._id} value={testItem._id}>
                                        {testItem.name}
                                    </option>
                                ))}
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
                                placeholder='Report Date'
                            />
                        </div>
                    </div>

                    <div className='btnDivModel'>
                        <div className='submit-model' onClick={handleCreateNew}>Submit</div>
                        <div className='submit-model' onClick={() => setInput({
                            name: "", age: "", address: "", mobileNo: "",
                            examinedBy: "", reportDate: "", test: listOfTest[0]?._id || "", examinedDate: ""
                        })}>
                            Clear
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Model;
