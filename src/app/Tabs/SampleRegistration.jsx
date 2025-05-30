"use client"
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { toast, ToastContainer } from 'react-toastify'
import Dialogbox from '@/app/components/Dialogbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const formSchema = z.object({
  sample_id: z.string().min(1, 'Sample ID is required'),
  sample_type: z.string().min(1, 'Sample Type is required'),
  client_name: z.string().min(1, 'Client Name is required'),
  docter_name: z.string().min(1, 'Doctor Name is required'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  // test_name: z.string().min(1, 'Test Name is required'),
  selectedTestName: z.string().min(1, 'Add the test name to confirm'),
  registration_date: z.string().min(1, 'Registration Date is required'),
  hospital_id: z.string().min(1, 'Hospital ID is required'),
  patient_name: z.string().min(1, 'Patient Name is required'),
  trf: z.string().min(1, 'TRF is required'),
  specimen_quality: z.string().min(1, 'Specimen Quality is required'),
  selectedTestName: z.string().min(1, 'Selected Test Name is required'),
  systolic_bp: z.string().optional(),
  diastolic_bp: z.string().optional(),
  total_cholesterol: z.string().optional(),
  hdl_cholesterol: z.string().optional(),
  ldl_cholesterol: z.string().optional(),
  diabetes: z.string().optional(),
  smoker: z.string().optional(),
  hypertension_treatment: z.string().optional(),
  statin: z.string().optional(),
  aspirin_therapy: z.string().optional(),
})

export const SampleRegistration = () => {
  const [showTestModal, setShowTestModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [trfFile, setTrfFile] = useState(null);
  const [trfUrl, setTrfUrl] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [hasSelectedFirstTest, setHasSelectedFirstTest] = useState(false);
  const [pendingTestToAdd, setPendingTestToAdd] = useState('');
  const [testToRemove, setTestToRemove] = useState(null); // <-- Add this line



  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hospital_name: '',
      vial_received: '',
      specimen_quality: '',
      registration_date: currentDate,
      sample_date: currentDate,
      sample_type: '',
      trf: '',
      collection_date_time: '',
      storage_condition: '',
      prority: '',
      hospital_id: '',
      client_id: '',
      client_name: '',
      sample_id: '',
      patient_name: '',
      DOB: '',
      age: '',
      sex: '',
      ethnicity: '',
      father_husband_name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      patient_mobile: '',
      docter_mobile: '',
      docter_name: '',
      email: '',
      test_name: '',
      remarks: '',
      clinical_history: '',
      repeat_required: '',
      repeat_reason: '',
      repeat_date: '',
      selectedTestName: '',
      systolic_bp: '',
      diastolic_bp: '',
      total_cholesterol: '',
      hdl_cholesterol: '',
      ldl_cholesterol: '',
      diabetes: '',
      smoker: '',
      hypertension_treatment: '',
      statin: '',
      aspirin_therapy: '',
    }
  })

  const allTests = [
    'WES',
    'CS',
    'Myeloid',
    'SGS',
    'SolidTumor Panel',
    'Cardio Comprehensive (Screening Test)',
    'Cardio Metabolic Syndrome (Screening Test)',
    'Cardio Comprehensive Myopathy'
  ];

  const dob = form.watch('DOB');
  const selectedTestName = form.watch('selectedTestName');
  const testName = form.watch('test_name');
  const repeatRequired = form.watch('repeat_required');


  const get_state_and_country = async (city) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1`
      );
      const data = response.data;
      if (data && data.length > 0 && data[0].address) {
        const address = data[0].address;
        form.setValue('state', address.state || address.state_district || '');
        form.setValue('country', address.country || '');
      } else {
        form.setValue('state', '');
        form.setValue('country', '');
      }
    } catch (error) {
      form.setValue('state', '');
      form.setValue('country', '');
      console.log(error);
    }
  };

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        // Get days in previous month
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      let ageString = '';
      if (years > 0) ageString += `${years} year${years > 1 ? 's' : ''} `;
      if (months > 0) ageString += `${months} month${months > 1 ? 's' : ''} `;
      if (days > 0) ageString += `${days} day${days > 1 ? 's' : ''}`;

      form.setValue('age', ageString.trim() || '0 days');
    } else {
      form.setValue('age', '');
    }
  }, [dob, form]);

  const uploadTrf = async (file) => {
    setTrfFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setTrfUrl(url);
      form.setValue('trf', file.name); // Store file name if needed
    } else {
      setTrfUrl('');
      form.setValue('trf', '');
    }
  }

  useEffect(() => {
    return () => {
      if (trfUrl) URL.revokeObjectURL(trfUrl);
    };
  }, [trfUrl]);

  const onFormSubmit = async () => {
    // Set registration_date to current date-time string
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Update the form value before getting all data
    form.setValue('registration_date', currentDate);

    // Now get all form data (including updated registration_date)
    const allData = form.getValues();
    console.log(allData);

    // const res = await axios.post('/api/store', allData);
    // if (res.status === 200) {
    //   toast.success('Sample registered successfully');
    //   // form.reset();
    // } else {
    //   toast.error('Sample registration failed');
    // }
  }


  const handleAddTestName = () => {
    if (!testName) {
      toast.error('Please select a test name');
      return;
    }

    if (selectedTests.includes(testName)) {
      toast.warning(`${testName} is already added`);
      return;
    }

    const updated = [...selectedTests, testName];
    setSelectedTests(updated);
    form.setValue('selectedTestName', updated.join(', '));
    toast.success(`${testName} added`);
    setShowTestModal(false);
    form.setValue('test_name', ''); // <-- Reset here
  };

  const handleRemoveTestName = () => {
    if (!testToRemove) {
      toast.error('Please select a test to remove');
      return;
    }
    const updated = selectedTests.filter(test => test !== testToRemove);
    setSelectedTests(updated);
    form.setValue('selectedTestName', updated.join(', '));
    setShowRemoveModal(false);
    toast.warning(`${testToRemove} removed`);
    setTestToRemove(null); // Reset
    if (updated.length === 0) {
      setHasSelectedFirstTest(false);
      form.setValue('test_name', ''); // Optionally reset test_name select
    }
  };

  // useEffect(() => {
  //   if (selectedTestName) {
  //     setSelectedTests(selectedTestName.split(',').map(t => t.trim()));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (pendingTestToAdd) {
  //     form.setValue('test_name', pendingTestToAdd);
  //     setShowTestModal(true);
  //     setPendingTestToAdd('');
  //   }
  // }, [pendingTestToAdd]);




  return (
    <div className='p-4'>
      {/*  <div className=' text-orange-500 text-lg font-semibold'>Sample Detail</div> */}
      <div className='p-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <FormField
              control={form.control}
              name='hospital_name'
              render={({ field }) => (
                <FormItem className='my-2'>
                  <FormLabel >Hospital Name</FormLabel>
                  <Input
                    placeholder='Hospital Name'
                    className='w-[50%] my-2'
                    disabled
                    {...field} />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-3 gap-10'>
              <FormField
                control={form.control}
                name='vial_received'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Vial Received</FormLabel>
                    <Input
                      placeholder='Vial Received'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='specimen_quality'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Specimen Quality</FormLabel>
                      {form.formState.errors.specimen_quality && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.specimen_quality.message}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        placeholder='Specimen Quality'
                        className='my-2'
                        {...field}
                      />

                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='registration_date'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Registration Date</FormLabel>
                    <Input
                      type='datetime-local'
                      className='my-2'
                      disabled
                      {...field} />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-4 gap-10'>
              {/* /* sample receiving date  */}
              <FormField
                control={form.control}
                name='sample_date'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Sample Date</FormLabel>
                    <Input
                      type='datetime-local'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              {/* sample type */}
              <FormField
                control={form.control}
                name='sample_type'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Sample Type</FormLabel>
                      {form.formState.errors.sample_type && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.sample_type.message}
                        </p>
                      )}
                    </div>
                    <Input
                      placeholder='Sample Type'
                      className='my-2'
                      {...field}
                    />
                  </FormItem>
                )}
              />
              {/* upload trf */}
              <FormField
                control={form.control}
                name='trf'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Upload TRF</FormLabel>
                      {form.formState.errors.trf && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.trf.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type='file'
                        accept='.pdf'
                        className='my-2'
                        onChange={e => uploadTrf(e.target.files[0])}
                      />
                      {trfUrl && (
                        <Button
                          type="button"
                          className="ml-2"
                          onClick={() => window.open(trfUrl, '_blank')}
                          variant="outline"
                        >
                          Preview TRF
                        </Button>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-3 gap-10'>
              {/* collection date time */}
              <FormField
                control={form.control}
                name='collection_date_time'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Collection Date Time</FormLabel>
                    <Input
                      type='datetime-local'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              {/* storage condition */}
              <FormField
                control={form.control}
                name='storage_condition'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Storage Condition</FormLabel>
                    <select
                      className=' dark:bg-gray-800 my-2 border rounded-md p-2'
                      {...field}>
                      <option className='dark:text-white' value=''>Select Storage Condition</option>
                      <option className='dark:text-white' value='refrigerated'>Refrigerated</option>
                      <option className='dark:text-white' value='ambient'>Ambient</option>
                    </select>
                  </FormItem>
                )}
              />
              {/* prority */}
              <FormField
                control={form.control}
                name='prority'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Prority</FormLabel>
                    <select
                      className=' dark:bg-gray-800 my-2 border rounded-md p-2'
                      {...field}>
                      <option className='dark:text-white' value=''>Select Prority</option>
                      <option className='dark:text-white' value='routine'>Routine</option>
                      <option className='dark:text-white' value='Urgent'>Urgent</option>

                    </select>
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-3 gap-10'>
              {/* hospital id */}
              <FormField
                control={form.control}
                name='hospital_id'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Hospital ID</FormLabel>
                      {form.formState.errors.hospital_id && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.hospital_id.message}
                        </p>
                      )}
                    </div>
                    <Input
                      placeholder='Hospital ID'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              {/* client id */}
              <FormField
                control={form.control}
                name='client_id'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Client ID</FormLabel>
                    <Input
                      placeholder='Client ID'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              {/* client name */}
              <FormField
                control={form.control}
                name='client_name'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Client Name</FormLabel>
                      {form.formState.errors.client_name && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.client_name.message}
                        </p>
                      )}
                    </div>
                    <Input
                      placeholder='Client Name'
                      className='my-2'
                      {...field}
                    />
                  </FormItem>
                )}
              />
            </div>

            {/* sample id */}
            <div className='w-[50%]'>
              <FormField
                control={form.control}
                name='sample_id'
                render={({ field }) => (
                  <FormItem className='my-2 flex-1'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Sample ID</FormLabel>
                      {form.formState.errors.sample_id && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.sample_id.message}
                        </p>
                      )}
                    </div>
                    <Input
                      placeholder='Sample ID'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-3 gap-10'>
              {/* patient name */}
              <FormField
                control={form.control}
                name='patient_name'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Patient Name</FormLabel>
                      {form.formState.errors.patient_name && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.patient_name.message}
                        </p>
                      )}
                    </div>
                    <Input
                      placeholder='Patient Name'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              {/* DOB */}
              <FormField
                control={form.control}
                name='DOB'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>DOB</FormLabel>
                    <Input
                      type='date'
                      className='my-2'
                      {...field} />
                  </FormItem>
                )}
              />
              {/* age */}
              <FormField
                control={form.control}
                name='age'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Age</FormLabel>
                    <Input
                      placeholder='Age'
                      className='my-2'
                      disabled
                      {...field} />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-4 gap-10'>
              <FormField
                control={form.control}
                name='sex'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Sex</FormLabel>
                    <select
                      className=' dark:bg-gray-800 my-2 border rounded-md p-2'
                      {...field}>
                      <option className='dark:text-white' value=''>Select Sex</option>
                      <option className='dark:text-white' value='male'>Male</option>
                      <option className='dark:text-white' value='female'>Female</option>
                      <option className='dark:text-white' value='other'>Other</option>
                    </select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='ethnicity'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Ethnicity</FormLabel>
                    <Input
                      placeholder='Ethnicity'
                      className='my-2'
                      {...field}
                    />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-4 gap-10">
              <FormField
                control={form.control}
                name='father_husband_name'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Father/Husband Name</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Father/Husband Name' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Address</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Address'
                    />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-3 gap-10'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>City</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='City'
                      onBlur={(e) => {
                        get_state_and_country(e.target.value);
                      }}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>State</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='State'
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Country</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Country'
                    />
                  </FormItem>
                )}
              />
            </div>


            <div className='grid grid-cols-4 gap-10'>
              <FormField
                control={form.control}
                name='patient_mobile'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Patient's Mobile</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Mobile'
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='docter_mobile'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Doctor's Mobile</FormLabel>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Mobile'
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='docter_name'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Doctor Name</FormLabel>
                      {form.formState.errors.docter_name && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.docter_name.message}
                        </p>
                      )}
                    </div>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Doctor Name'
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Email</FormLabel>
                      {form.formState.errors.email && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Input
                      {...field}
                      className='my-2'
                      placeholder='Email'
                    />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-10 ">


              <div className="flex gap-4 items-end my-2 w-[60%]">
                <FormField
                  control={form.control}
                  name='test_name'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <div className="flex justify-between items-center">
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            className="h-10 bg-gray-800 text-white"
                          >
                            Add Test
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-[250px]">
                          {allTests
                            .filter(test => !selectedTests.includes(test))
                            .map(test => (
                              <DropdownMenuItem
                                key={test}
                                onClick={() => {
                                  if (selectedTests.includes(test)) {
                                    toast.warning(`${test} is already added`);
                                    return;
                                  }
                                  const updated = [...selectedTests, test];
                                  setSelectedTests(updated);
                                  form.setValue('selectedTestName', updated.join(', '));
                                  toast.success(`${test} added`);
                                  setHasSelectedFirstTest(true);
                                  form.setValue('test_name', ''); // Reset if needed
                                }}
                              >
                                <span className="text-sm">{test}</span>
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormItem>
                  )}
                />


              </div>

              {/* </div> */}

              <div>
                {/* Selected Test Name with Remove Button */}
                <div className="flex gap-4 items-end my-2 w-[60%]">
                  <FormField
                    control={form.control}
                    name='selectedTestName'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel>Test Added</FormLabel>
                          {form.formState.errors.selectedTestName && (
                            <p className='text-red-500 text-sm'>
                              {form.formState.errors.selectedTestName.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[42px] border rounded-md p-2 dark:bg-gray-800">
                          {selectedTests.length === 0 && (
                            <span className="text-gray-400 dark:text-white">No test added</span>
                          )}
                          {selectedTests.map((test, idx) => (
                            <span
                              key={test}
                              className="flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-semibold"
                            >
                              {test}
                              <button
                                type="button"
                                className="ml-2 text-orange-700 hover:text-red-600 focus:outline-none"
                                onClick={() => {
                                  setTestToRemove(test); // <-- Set which test to remove
                                  setShowRemoveModal(true); // <-- Open dialog
                                }}
                                aria-label={`Remove ${test}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Remove Test Name Dialog */}
                <Dialogbox
                  open={showRemoveModal}
                  setOpen={setShowRemoveModal}
                  testName={testToRemove} // <-- Use testToRemove here
                  type="remove"
                  onRemove={handleRemoveTestName}
                />
              </div>


            </div>

            {/* Add Test Name Dialog */}

            <Dialogbox
              open={showTestModal}
              setOpen={(open) => {
                setShowTestModal(open);
                if (!open) {
                  form.setValue('test_name', ''); // Reset test_name when dialog closes
                }
              }}
              type="add"
              testName={form.watch('test_name')}
              onAdd={() => { handleAddTestName() }}
            />






            <div className='grid grid-cols-2 gap-10'>

              <FormField
                control={form.control}
                name='remarks'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Remarks</FormLabel>
                    <textarea
                      placeholder='Remarks'
                      {...field}
                      className='my-2 border rounded-md p-2'
                    >

                    </textarea>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='clinical_history'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Clinical History</FormLabel>
                    <textarea
                      placeholder='Clinical History'
                      {...field}
                      className='my-2 border rounded-md p-2'
                    >
                    </textarea>
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-4 gap-10'>
              <FormField
                control={form.control}
                name='repeat_required'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Repeat Required</FormLabel>
                    <select
                      className=' dark:bg-gray-800 my-2 border rounded-md p-2'
                      {...field}>
                      <option className='dark:text-white' value=''>Select Repeat Required</option>
                      <option className='dark:text-white' value='yes'>Yes</option>
                      <option className='dark:text-white' value='no'>No</option>
                    </select>
                  </FormItem>
                )}
              />
              {repeatRequired === 'yes' && (
                <>
                  <FormField
                    control={form.control}
                    name='repeat_reason'
                    render={({ field }) => (
                      <FormItem className='my-2'>
                        <FormLabel>Repeat Reason</FormLabel>
                        <Input
                          placeholder='Repeat Reason'
                          className='my-2'
                          {...field} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='repeat_date'
                    render={({ field }) => (
                      <FormItem className='my-2'>
                        <FormLabel>Repeat Date</FormLabel>
                        <Input
                          type='date'
                          className='my-2'
                          {...field} />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>



            {[
              "Cardio Comprehensive (Screening Test)",
              "Cardio Metabolic Syndrome (Screening Test)",
              "Cardio Comprehensive Myopathy"
            ].some(test => selectedTests.includes(test)) && (
                <div className="my-8">
                  {/* Cardio-specific fields */}
                  <div className="grid grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="systolic_bp"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Systolic Blood Pressure <span className="text-xs font-normal">(mm Hg)</span> <span className="text-orange-500">*</span></FormLabel>
                          <Input {...field} placeholder="90-200" type="number" min={90} max={200} />
                          <p className="text-xs text-gray-500">Value must be between 90-200</p>
                          {form.formState.errors.systolic_bp && (
                            <p className="text-red-500 text-sm">{form.formState.errors.systolic_bp.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="diastolic_bp"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Diastolic Blood Pressure <span className="text-xs font-normal">(mm Hg)</span> <span className="text-orange-500">*</span></FormLabel>
                          <Input {...field} placeholder="60-130" type="number" min={60} max={130} />
                          <p className="text-xs text-gray-500">Value must be between 60-130</p>
                          {form.formState.errors.diastolic_bp && (
                            <p className="text-red-500 text-sm">{form.formState.errors.diastolic_bp.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="total_cholesterol"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Total Cholesterol <span className="text-xs font-normal">(mg/dL)</span> <span className="text-orange-500">*</span></FormLabel>
                          <Input {...field} placeholder="130-320" type="number" min={130} max={320} />
                          <p className="text-xs text-gray-500">Value must be between 130 - 320</p>
                          {form.formState.errors.total_cholesterol && (
                            <p className="text-red-500 text-sm">{form.formState.errors.total_cholesterol.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hdl_cholesterol"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>HDL Cholesterol <span className="text-xs font-normal">(mg/dL)</span> <span className="text-orange-500">*</span></FormLabel>
                          <Input {...field} placeholder="20-100" type="number" min={20} max={100} />
                          <p className="text-xs text-gray-500">Value must be between 20 - 100</p>
                          {form.formState.errors.hdl_cholesterol && (
                            <p className="text-red-500 text-sm">{form.formState.errors.hdl_cholesterol.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ldl_cholesterol"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>LDL Cholesterol <span className="text-xs font-normal">(mg/dL)</span> <span className="text-orange-500">*</span></FormLabel>
                          <Input {...field} placeholder="30-300" type="number" min={30} max={300} />
                          <p className="text-xs text-gray-500">Value must be between 30 - 300</p>
                          {form.formState.errors.ldl_cholesterol && (
                            <p className="text-red-500 text-sm">{form.formState.errors.ldl_cholesterol.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Yes/No and multi-choice buttons */}
                  <div className="grid grid-cols-2 gap-8 mt-6">
                    <FormField
                      control={form.control}
                      name="diabetes"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>History of Diabetes? <span className="text-orange-500">*</span></FormLabel>
                          <div className="flex gap-2">
                            <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                            <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                          </div>
                          {form.formState.errors.diabetes && (
                            <p className="text-red-500 text-sm">{form.formState.errors.diabetes.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smoker"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>Smoker? <span className="text-orange-500">*</span></FormLabel>
                          <div className="flex gap-2">
                            {["current", "former", "never"].map(opt => (
                              <Button
                                key={opt}
                                type="button"
                                variant={field.value === opt ? "default" : "outline"}
                                onClick={() => field.onChange(opt)}
                              >
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </Button>
                            ))}
                          </div>
                          {form.formState.errors.smoker && (
                            <p className="text-red-500 text-sm">{form.formState.errors.smoker.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hypertension_treatment"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>On Hypertension Treatment? <span className="text-orange-500">*</span></FormLabel>
                          <div className="flex gap-2">
                            <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                            <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                          </div>
                          {form.formState.errors.hypertension_treatment && (
                            <p className="text-red-500 text-sm">{form.formState.errors.hypertension_treatment.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="statin"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>On a Statin? <span className="text-orange-500">*</span></FormLabel>
                          <div className="flex gap-2">
                            <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                            <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                          </div>
                          {form.formState.errors.statin && (
                            <p className="text-red-500 text-sm">{form.formState.errors.statin.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aspirin_therapy"
                      render={({ field }) => (
                        <FormItem className="my-2">
                          <FormLabel>On Aspirin Therapy? <span className="text-orange-500">*</span></FormLabel>
                          <div className="flex gap-2">
                            <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                            <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                          </div>
                          {form.formState.errors.aspirin_therapy && (
                            <p className="text-red-500 text-sm">{form.formState.errors.aspirin_therapy.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

            <div className="my-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
              <div className="font-semibold mb-1">Note</div>
              <ul className="list-disc pl-5 text-sm">
                <li>Checks for missing/invalid inputs before submission</li>
                <li>Warns about duplicate sample entries or patient records</li>
                <li>Who accessed, processed, or modified the sample data</li>
              </ul>
            </div>

            <Button
              type='submit'
              className='bg-orange-500 text-white hover:bg-orange-600 my-4'
            >
              Submit
            </Button>
            <Button
              type='reset'
              className='bg-gray-500 text-white hover:bg-gray-600 my-4 ml-2'
              onClick={() => {
                form.reset();
              }}
            >
              Reset
            </Button>
          </form>
        </Form>
      </div>
      <ToastContainer />
    </div>
  )
}