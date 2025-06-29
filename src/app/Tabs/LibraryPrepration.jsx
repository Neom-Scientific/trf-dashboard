import React, { use, useEffect, useState, useMemo, useRef } from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setActiveTab } from "@/lib/redux/slices/tabslice";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";


const LibraryPrepration = () => {
  const [message, setMessage] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [testName, setTestName] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedSampleIndicator, setSelectedSampleIndicator] = useState('');
  const [showPooledFields, setShowPooledFields] = useState(false);
  const [pooledValues, setPooledValues] = useState({});
  const [showPooledRowIndex, setShowPooledRowIndex] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [getTheTestNames, setGetTheTestNames] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [bulkValue, setBulkValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pooledRowData, setPooledRowData] = useState([]); // [{ sampleIndexes: [1, 2, 3], values: {} }]
  const [currentSelection, setCurrentSelection] = useState([]);
  const [DialogOpen, setDialogOpen] = useState(false);
  const user = JSON.parse(Cookies.get('user') || '{}');
  const testNameRef = useRef(testName);
  const dispatch = useDispatch();

  useEffect(() => {
    testNameRef.current = testName;
  }, [testName]);


  const allColumns = [
    { key: 'hospital_name', label: 'Hospital Name' },
    { key: 'vial_received', label: 'Vial Received' },
    { key: 'specimen_quality', label: 'Specimen Quality' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'internal_id', label: 'Internal ID' },
    { key: 'sample_date', label: 'Sample Date' },
    { key: 'sample_type', label: 'Sample Type' },
    { key: 'trf', label: 'TRF' },
    { key: 'collection_date_time', label: 'Collection Date Time' },
    { key: 'storage_condition', label: 'Storage Condition' },
    { key: 'prority', label: 'Prority' },
    { key: 'hospital_id', label: 'Hospital ID' },
    { key: 'client_id', label: 'Client ID' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'sample_id', label: 'Sample ID' },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'DOB', label: 'DOB' },
    { key: 'age', label: 'Age' },
    { key: 'sex', label: 'Sex' },
    { key: 'ethnicity', label: 'Ethnicity' },
    { key: 'father_husband_name', label: 'Father/Husband Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'patient_mobile', label: "Patient's Mobile" },
    { key: 'docter_mobile', label: "Doctor's Mobile" },
    { key: 'docter_name', label: 'Doctor Name' },
    { key: 'email', label: 'Email' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'clinical_history', label: 'Clinical History' },
    { key: 'repeat_required', label: 'Repeat Required' },
    { key: 'repeat_reason', label: 'Repeat Reason' },
    { key: 'repeat_date', label: 'Repeat Date' },
    { key: 'selectedTestName', label: 'Selected Test Name' },
    { key: 'systolic_bp', label: 'Systolic BP' },
    { key: 'diastolic_bp', label: 'Diastolic BP' },
    { key: 'total_cholesterol', label: 'Total Cholesterol' },
    { key: 'hdl_cholesterol', label: 'HDL Cholesterol' },
    { key: 'ldl_cholesterol', label: 'LDL Cholesterol' },
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'smoker', label: 'Smoker' },
    { key: 'hypertension_treatment', label: 'Hypertension Treatment' },
    { key: 'statin', label: 'Statin' },
    { key: 'aspirin_therapy', label: 'Aspirin Therapy' },
    { key: 'dna_isolation', label: 'DNA Isolation' },
    { key: 'lib_prep', label: 'Library Prep' },
    { key: 'under_seq', label: 'Under Sequencing' },
    { key: 'seq_completed', label: 'Sequencing Completed' },
    { key: 'conc_rxn', label: 'conc/rxn (ng/rxn)' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'i5_index_reverse', label: 'i5 (reverse)' },
    { key: 'i5_index_forward', label: 'i5 (forward)' },
    { key: 'i7_index', label: 'i7 index' },
    { key: 'size', label: 'Size (bp)' },
    { key: 'lib_qubit', label: 'Lib Qubit ng/ml' },
    { key: 'nm_conc', label: 'nM conc' },
    { key: 'lib_vol_for_2nm', label: 'Library Volume for 2nM from 1/10 of nM' },
    { key: 'nfw_volu_for_2nm', label: 'NFW Volume For 2nM' },
    { key: 'total_vol_for_2nm', label: 'Total Volume For 2nM' },
    { key: 'qubit_dna', label: 'Qubit DNA (ng/ul)' },
    { key: 'per_rxn_gdna', label: 'Per Rxn gDNA (ng/rxn)' },
    { key: 'volume', label: 'Volume (ul)' },
    { key: 'gdna_volume_3x', label: 'gDNA Volume (ul) (3X)' },
    { key: 'nfw', label: 'NFW (ul) (3x)' },
    { key: 'plate_designation', label: 'Plate Designation' },
    { key: 'well', label: 'Well No./Barcode' },
    { key: 'qubit_lib_qc_ng_ul', label: 'Library Qubit (ng/ul)' },
    { key: 'stock_ng_ul', label: 'Stock (ng/ul)' },
    { key: 'lib_vol_for_hyb', label: 'Library Volume for Hyb (ul)' },
    { key: 'sample_volume', label: 'Sample Volume (ul)' },
    { key: 'pooling_volume', label: 'Pooling Volume (ul)' },
    { key: 'pool_conc', label: 'Pooled Library Conc. (ng/ul)' },
    { key: 'one_tenth_of_nm_conc', label: '1/10th of nM Conc' },
    { key: 'data_required', label: 'Data Required(GB)' },
    { key: 'pool_no', label: 'Pool No.' },
  ];


  const pooledColumns = [
    "pool_conc",
    "size",
    "nm_conc",
    "one_tenth_of_nm_conc",
    "total_vol_for_2nm",
    "lib_vol_for_2nm",
    "nfw_volu_for_2nm",
  ];

  const insertPooledColumns = (columns) => {
    const result = [];
    for (let col of columns) {
      if (col === "data_required") {
        result.push(...pooledColumns); // insert pooled columns before data_required
      }
      result.push(col);
    }
    return result;
  };

  const getDefaultVisible = (testName) => {
    if (testName === "Myeloid") {
      return insertPooledColumns([
        "sno",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "sample_type",
        "qubit_dna",
        "conc_rxn",
        "barcode",
        "i5_index_forward",
        "i5_index_reverse",
        "i7_index",
        "size",
        "lib_qubit",
        "nm_conc",
        "total_vol_for_2nm",
        "lib_vol_for_2nm",
        "nfw_volu_for_2nm",
        "data_required",
      ]);
    } else if (
      testName === "WES" ||
      testName === "CS" ||
      testName === "CES" ||
      testName === "Cardio Comprehensive (Screening Test)" ||
      testName === "Cardio Metabolic Syndrome (Screening Test)" ||
      testName === "Cardio Comprehensive Myopathy" ||
      testName === "WES + Mito" ||
      testName === "CES + Mito" ||
      testName === "HRR" ||
      testName === "HCP"
    ) {
      return insertPooledColumns([
        "select",
        "sno",
        "pool_no",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "qubit_dna",
        "per_rxn_gdna",
        "volume",
        "gdna_volume_3x",
        "nfw",
        "plate_designation",
        "well",
        "i5_index_reverse",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "lib_vol_for_hyb",
        "data_required",
      ]);
    } else if (testName === "SGS" || testName === "HLA") {
      return insertPooledColumns([
        "select",
        "sno",
        "pool_no",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "qubit_dna",
        "sample_volume",
        "well",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "pooling_volume",
        "data_required",
      ]);
    }
    return [];
  };


  const [columnVisibility, setColumnVisibility] = useState(() => {
    const defaultVisible = getDefaultVisible(testName);
    const visibility = allColumns.reduce((acc, col) => {
      acc[col.key] = defaultVisible.includes(col.key);
      return acc;
    }, {});
    // Ensure select column visibility is set if needed
    if (defaultVisible.includes("select")) {
      visibility["select"] = true;
    }
    return visibility;
  });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
    if (Object.keys(storedData).length === 0) {
      setMessage(1); // Set message to indicate no data available
    } else {
      setMessage(0); // Reset message if data is available
    }
  }, []);

  useEffect(() => {
    const fetchPoolInfo = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
        // Fix: handle both array and object format for allSampleIds
        const allSampleIds = Object.values(storedData)
          .flatMap(val => {
            if (Array.isArray(val)) {
              return val.map(row => row.sample_id);
            } else if (val && Array.isArray(val.rows)) {
              return val.rows.map(row => row.sample_id);
            }
            return [];
          })
          .filter(Boolean);
        const testName = Object.keys(storedData)[0];

        // If local data exists for this testName, use it and do not overwrite
        if (testName && storedData[testName]) {
          if (Array.isArray(storedData[testName])) {
            setTableRows(storedData[testName]);
            setPooledRowData([]);
          } else {
            setTableRows(storedData[testName].rows || []);
            setPooledRowData(storedData[testName].pools || []);
          }
          setGetTheTestNames(Object.keys(storedData));
          setTestName(testName);
          return; // Do not fetch or overwrite with API data
        }

        // Otherwise, fetch from API
        const response = await axios.get(`/api/pool-data`, {
          params: {
            hospital_name: user.hospital_name,
            application: testName,
            sample_id: allSampleIds.join(','), // Join sample IDs into a comma-separated string
          },
        });
        if (response.data[0].status === 200) {
          const poolData = response.data[0].data;
          if (poolData && poolData.length > 0) {
            // Transform data into testName: [...] format
            const newData = poolData.reduce((acc, row) => {
              const tn = row.test_name;
              if (!acc[tn]) acc[tn] = [];
              acc[tn].push(row);
              return acc;
            }, {});

            // Only update localStorage if there was no local data for this testName
            if (!storedData[testName] || (Array.isArray(storedData[testName]) && storedData[testName].length === 0)) {
              const mergedData = { ...storedData, ...newData };
              setTableRows(newData[testName] || []);
              setPooledRowData([]);
              setGetTheTestNames(Object.keys(mergedData));
              setTestName(Object.keys(newData)[0]);
              localStorage.setItem('libraryPreparationData', JSON.stringify(mergedData));
            } else {
              if (Array.isArray(storedData[testName])) {
                setTableRows(storedData[testName]);
                setPooledRowData([]);
              } else {
                setTableRows(storedData[testName].rows || []);
                setPooledRowData(storedData[testName].pools || []);
              }
              setGetTheTestNames(Object.keys(storedData));
              setTestName(testName);
            }
          } else {
            setMessage(1);
          }
        }
      } catch (error) {
        console.error("Error fetching pool info:", error);
        toast.error("An error occurred while fetching pool info.");
      }
    };

    fetchPoolInfo();
  }, []);

  const columns = useMemo(() => {
    const defaultVisible = getDefaultVisible(testName);

    const columnsArr = [];

    // Add checkbox column
    if (defaultVisible.includes("select")) {
      columnsArr.push({
        accessorKey: "select",
        header: "",
        cell: ({ row }) => (
          <Checkbox
            checked={rowSelection[row.id] || false}
            onCheckedChange={(checked) => {
              const newSelection = { ...rowSelection, [row.id]: checked };
              if (!checked) delete newSelection[row.id];
              setRowSelection(newSelection);
            }}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Add S. No. column
    columnsArr.push({
      accessorKey: "sno",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    });

    // Map all defaultVisible (excluding already handled keys)
    defaultVisible.forEach((key) => {
      if (["select", "sno"].includes(key)) return;

      const column = allColumns.find(col => col.key === key);
      if (!column) {
        console.warn(`Column with key "${key}" not found in allColumns.`);
        return;
      }

      columnsArr.push({
        accessorKey: column.key,
        header: column.label,
        cell: (info) => {
          const value = typeof info.getValue === "function"
            ? info.getValue()
            : (info.row && info.row.original ? info.row.original[key] : "");
          if (key === "registration_date") {
            if (!value) return "";
            const date = new Date(value);
            if (isNaN(date)) return value;
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          }

          if (pooledColumns.includes(key)) {
            return <span>{value}</span>;
          }

          if (
            column.key === "sno" ||
            column.key === "sample_id" ||
            column.key === "test_name" ||
            column.key === "patient_name" ||
            column.key === "sample_type" ||
            column.key === "pool_no" ||
            column.key === "internal_id"
          ) {
            return <span>{value}</span> || "";
          }

          return (
            <InputCell
              value={value || ""}
              rowIndex={info.row.index}
              columnId={key}
              updateData={table.options.meta.updateData}
            />
          );
        },
      });
    });

    return columnsArr;
  }, [testName, rowSelection, allColumns, pooledColumns]);

  useEffect(() => {
    const defaultVisible = getDefaultVisible(testName);
    const visibility = allColumns.reduce((acc, col) => {
      acc[col.key] = defaultVisible.includes(col.key);
      return acc;
    }, {});
    setColumnVisibility(visibility); // force update visibility
  }, [testName]);

  useEffect(() => {
    let defaultVisible = [];
    if (testName === "Myeloid") {
      defaultVisible = [
        "sno",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "sample_type",
        "qubit_dna",
        "conc_rxn",
        "barcode",
        "i5_index_forward",
        "i5_index_reverse",
        "i7_index",
        "size",
        "lib_qubit",
        "nm_conc",
        "total_vol_for_2nm",
        "lib_vol_for_2nm",
        "nfw_volu_for_2nm",
        "data_required",
      ];
    } else if (
      testName === "WES" ||
      testName === "CS" ||
      testName === "CES" ||
      testName === "Cardio Comprehensive (Screening Test)" ||
      testName === "Cardio Metabolic Syndrome (Screening Test)" ||
      testName === "WES + Mito" ||
      testName === "CES + Mito" ||
      testName === "HRR" ||
      testName === "HCP" ||
      testName === "Cardio Comprehensive Myopathy"
    ) {
      defaultVisible = [
        "sno",
        "select",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "qubit_dna",
        "per_rxn_gdna",
        "volume",
        "gdna_volume_3x",
        "nfw",
        "plate_designation",
        "well",
        "i5_index_reverse",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "lib_vol_for_hyb",
        "data_required",
      ];
    }
    else if (testName === "SGS" || testName === 'HLA') {
      defaultVisible = [
        "sno",
        "select",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "qubit_dna",
        "well",
        "i7_index",
        "sample_volume",
        "qubit_lib_qc_ng_ul",
        "pooling_volume",
        "data_required",
      ];
    }

    const visibleColumns = defaultVisible.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    // // Ensure all columns are included in the visibility state
    // columns.forEach((col) => {
    //   if (!visibleColumns.hasOwnProperty(col.accessorKey)) {
    //     visibleColumns[col.accessorKey] = false;
    //   }
    // });

    // Only update state if it has changed
    setColumnVisibility(prev => {
      const isEqual = Object.keys(visibleColumns).every(
        key => prev[key] === visibleColumns[key]
      );
      return isEqual ? prev : visibleColumns;
    });
  }, [testName, columns]);

  const table = useReactTable({
    data: tableRows,
    columns,
    state: {
      sorting,
      columnVisibility, // Pass the updated columnVisibility state
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility, // Sync visibility changes
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setTableRows((prev) => {
          const updatedRows = prev.map((row, idx) => {
            if (idx !== rowIndex) return row; // Only update the specific row

            // Update the current field
            const updatedRow = { ...row, [columnId]: value };

            // Apply formulas dynamically
            const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;
            const lib_vol_for_2nm = parseFloat(updatedRow.lib_vol_for_2nm) || 0;
            const per_rxn_gdna = parseFloat(updatedRow.per_rxn_gdna) || 0;
            const volume = parseFloat(updatedRow.volume) || 0;
            const qubit_lib_qc_ng_ul = parseFloat(updatedRow.qubit_lib_qc_ng_ul) || 0;
            const one_tenth_of_nm_conc = parseFloat(updatedRow.one_tenth_of_nm_conc) || 0;
            const size = parseFloat(updatedRow.size) || 0;
            const nm_conc = parseFloat(updatedRow.nm_conc) || 0;
            const qubit_dna = parseFloat(updatedRow.qubit_dna) || 0;

            if (columnId === "lib_qubit" || columnId === "total_vol_for_2nm") {
              const lib_qubit = parseFloat(updatedRow.lib_qubit) || 0;
              const size = parseFloat(updatedRow.size) || 0;
              const nm_conc = lib_qubit > 0 ? (lib_qubit / (size * 660)) * 1000 : 0;

              updatedRow.nm_conc = parseFloat(nm_conc.toFixed(2));

              const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;

              if (nm_conc > 0 && total_vol_for_2nm > 0) {
                updatedRow.lib_vol_for_2nm = parseFloat(((3 * total_vol_for_2nm) / nm_conc).toFixed(2));
                if (updatedRow.lib_vol_for_2nm > total_vol_for_2nm) {
                  updatedRow.lib_vol_for_2nm = total_vol_for_2nm; // Cap lib_vol_for_2nm to total_vol_for_2nm
                }
                updatedRow.nfw_volu_for_2nm = parseFloat((total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2));
                console.log('nfw_volu_for_2nm:', updatedRow.nfw_volu_for_2nm);
                console.log('lib_vol_for_2nm:', updatedRow.lib_vol_for_2nm);
                console.log('total_vol_for_2nm:', total_vol_for_2nm);
              } else {
                updatedRow.lib_vol_for_2nm = 0;
                updatedRow.nfw_volu_for_2nm = total_vol_for_2nm; // Default to total_vol_for_2nm if lib_vol_for_2nm is invalid
              }
              return updatedRow;
            }


            if (columnId === 'pool_conc' || columnId === 'size') {
              const poolConc = parseFloat(updatedRow.pool_conc) || 0;
              updatedRow.nm_conc = size > 0 ? ((poolConc / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
            }

            if (qubit_lib_qc_ng_ul) {
              updatedRow.lib_vol_for_hyb = parseFloat(200 / qubit_lib_qc_ng_ul).toFixed(2)
            }

            if (columnId === "size") {
              updatedRow.one_tenth_of_nm_conc = nm_conc > 0 ? (parseFloat((nm_conc / 10).toFixed(2))) : "";
            }
            if (qubit_dna || per_rxn_gdna) {
              updatedRow.gdna_volume_3x = qubit_dna > 0 ? Math.ceil((per_rxn_gdna / qubit_dna) * 3) : "";
            }

            if (columnId === "volume" || columnId === "gdna_volume_3x") {
              const gdna_volume_3x = parseFloat(updatedRow.gdna_volume_3x) || 0;
              updatedRow.nfw = volume > 0 ? volume - gdna_volume_3x : "";
            }

            if (columnId === "qubit_lib_qc_ng_ul") {
              updatedRow.stock_ng_ul = qubit_lib_qc_ng_ul > 0 ? qubit_lib_qc_ng_ul * 10 : "";
              updatedRow.lib_vol_for_hyb = (200 / qubit_lib_qc_ng_ul).toFixed(2);

            }
            if (columnId === "stock_ng_ul") {
              const stock = parseFloat(value) || 0;
              updatedRow.stock_ng_ul = stock;
              // console.log('Parsed stock_ng_ul:', stock);
              // console.log('lib_vol_for_hyb:', updatedRow.lib_vol_for_hyb);
            }

            if (columnId === "qubit_lib_qc_ng_ul") {
              updatedRow.pooling_volume = qubit_lib_qc_ng_ul > 0 ? (200 / qubit_lib_qc_ng_ul).toFixed(2) : "";
            }

            // if (columnId === 'lib_qc_for_ng_ul' || columnId === 'size') {
            //   updatedRow.nm_conc = size > 0 ? ((qubit_lib_qc_ng_ul / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
            // }
            if (columnId === 'pool_conc' || columnId === 'size') {
              updatedRow.one_tenth_of_nm_conc = updatedRow.nm_conc > 0 ? (parseFloat((updatedRow.nm_conc / 10).toFixed(2))) : "";
              // console.log('nm_conc:', updatedRow.nm_conc);
              // console.log('one_tenth_of_nm_conc:', updatedRow.one_tenth_of_nm_conc);
            }

            if (columnId === "one_tenth_of_nm_conc" || columnId === "total_vol_for_2nm" || columnId === "lib_vol_for_2nm") {
              updatedRow.total_vol_for_2nm = one_tenth_of_nm_conc > 0 ? (one_tenth_of_nm_conc * lib_vol_for_2nm / 2).toFixed(2) : "";
              updatedRow.nfw_volu_for_2nm = total_vol_for_2nm > 0 ? (updatedRow.total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2) : "";
            }
            return updatedRow;

          })

          // Save to localStorage
          const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
          const currentTestName = testNameRef.current;
          if (currentTestName) {
            if (Array.isArray(storedData[currentTestName])) {
              // Upgrade old format to new
              storedData[currentTestName] = { rows: updatedRows, pools: pooledRowData };
            } else {
              storedData[currentTestName] = {
                rows: updatedRows,
                pools: pooledRowData,
              };
            }
            localStorage.setItem('libraryPreparationData', JSON.stringify(storedData));
          }
          return updatedRows;
        });
      },
    },
  });

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
      // const poolNos = [...new Set(tableRows.map(row => row.pool_no).filter(Boolean))];

      // Prepare the payload for the API call
      const payload = {
        hospital_name: user.hospital_name,
        testName: testName,
        // pool_no: poolNos || "",
        rows: tableRows,
      };

      console.log('payload:', payload);

      const response = await axios.post('/api/pool-data', payload);

      if (response.data[0].status === 200) {
        toast.success("Sample indicator updated successfully!");
        setProcessing(false);
        // Remove only the selected testName's data
        const updatedData = { ...storedData };
        // delete updatedData[testName];

        localStorage.setItem('libraryPreparationData', JSON.stringify(updatedData));
        // setTableRows([]); 
        // setMessage(1); // Set message to indicate no data available
      } else if (response.data[0].status === 400) {
        toast.error(response.data[0].message);
        setProcessing(false);
      }
    } catch (error) {
      console.log("Error updating values:", error);
      setProcessing(false);
      toast.error("An error occurred while updating the values.");
    }
  };

  const handleDone = async () => {
    if (Array.isArray(currentSelection) && currentSelection.length > 0) {
      try {
        const response = await axios.get('/api/pool-no');
        if (response.data[0].status === 200) {
          const poolNo = response.data[0].pool_no;
          setTableRows(prevRows =>
            prevRows.map((row, idx) =>
              currentSelection.includes(idx)
                ? { ...row, pool_no: poolNo }
                : row
            )
          );
          setPooledRowData(prev => [
            ...prev,
            { sampleIndexes: [...currentSelection], values: pooledValues }
          ]);
          setPooledValues({});
          setCurrentSelection([]);
          setShowPooledFields(false);
          setRowSelection({});
        } else {
          toast.error(response.data[0].message);
        }
      } catch (error) {
        console.log('something went wrong:', error);
      }
    }
  };

  const editableColumns = allColumns
    .map(col => col.key)
    .filter(key =>
      !["sno", "select", "sample_id", "test_name", "patient_name", "sample_type", "pool_no", "internal_id"].includes(key)
      && !pooledColumns.includes(key) // if you don't want pooled columns to be editable
    );

  useEffect(() => {
    // For each pool, update all rows in tableRows that belong to that pool
    setTableRows(prevRows => {
      // Ensure prevRows is always an array
      const safeRows = Array.isArray(prevRows) ? prevRows : [];
      let updatedRows = [...safeRows];
      pooledRowData.forEach(pool => {
        pool.sampleIndexes.forEach(idx => {
          updatedRows[idx] = {
            ...updatedRows[idx],
            ...pooledColumns.reduce((acc, col) => {
              acc[col] = pool.values[col] ?? "";
              return acc;
            }, {})
          };
        });
      });
      return updatedRows;
    });
  }, [pooledRowData]);

  const InputCell = ({ value: initialValue, rowIndex, columnId, updateData }) => {
    const [value, setValue] = useState(initialValue || "");
    const inputRef = useRef(null);

    const isSelected = selectedCells.some(
      cell => cell.rowIndex === rowIndex && cell.columnId === columnId
    );


    const handleChange = (e) => {
      setValue(e.target.value);
      // handleBlur(); // Update data immediately on change
    };

    const handleBlur = () => {
      updateData(rowIndex, columnId, value);
    };

    // useEffect(() => {
    //   updateData(rowIndex, columnId, value);
    // }, [value, rowIndex, columnId, updateData]);

    const handleMouseDown = (e) => {
      setIsSelecting(true);
      setSelectionStart({ rowIndex, columnId });
      setSelectedCells([{ rowIndex, columnId }]);
    };

    // const editableColumns = allColumns
    //   .map(col => col.key)
    //   .filter(key =>
    //     !["sno", "select", "sample_id", "test_name", "patient_name", "sample_type", "pool_no", "internal_id"].includes(key)
    //     && !pooledColumns.includes(key) // if you don't want pooled columns to be editable
    //   );

    const handleMouseEnter = (e) => {
      if (isSelecting && selectionStart) {
        const cells = [];
        const minRow = Math.min(selectionStart.rowIndex, rowIndex);
        const maxRow = Math.max(selectionStart.rowIndex, rowIndex);
        const visibleColumns = columns.map(col => col.accessorKey);
        const startColIdx = visibleColumns.indexOf(selectionStart.columnId);
        const endColIdx = visibleColumns.indexOf(columnId);
        const minCol = Math.min(startColIdx, endColIdx);
        const maxCol = Math.max(startColIdx, endColIdx);
    
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const colKey = visibleColumns[c];
            if (editableColumns.includes(colKey)) {
              cells.push({ rowIndex: r, columnId: colKey });
            }
          }
        }
        setSelectedCells(cells);
      }
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      setSelectionStart(null);
    };

    const lastSelectedCell = useRef(null);

    const handleCellClick = (e) => {
      if (e.ctrlKey || e.metaKey) {
        setSelectedCells(prev =>
          isSelected
            ? prev.filter(cell => !(cell.rowIndex === rowIndex && cell.columnId === columnId))
            : [...prev, { rowIndex, columnId }]
        );
      } else {
        setSelectedCells([{ rowIndex, columnId }]);
      }
    };

    return (
      <Input
        ref={inputRef}
        className={`border border-orange-300 rounded p-1 text-xs w-[200px] ${isSelected ? "ring-2 ring-orange-500 bg-orange-50" : ""}`}
        value={value}
        type="text"
        placeholder={`Enter ${columnId}`}
        onChange={handleChange}
        onBlur={handleBlur}
        tabIndex={0} // ensure it's tabbable
        // onClick={handleCellClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
      />
    );
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (!selectedCells.length) return;
  
      const clipboard = e.clipboardData.getData("text/plain");
      if (!clipboard) return;
  
      // Parse clipboard into a 2D array
      const rows = clipboard.split(/\r?\n/).filter(Boolean).map(row => row.split('\t'));
      if (rows.length === 0) return;
  
      const visibleColumns = columns.map(col => col.accessorKey)
      const visibleEditableColumns = visibleColumns.filter(key => editableColumns.includes(key));
  
      // Find the top-left cell in the selection
      const rowIndexes = selectedCells.map(cell => cell.rowIndex);
      const colIndexes = selectedCells.map(cell => visibleEditableColumns.indexOf(cell.columnId));
      const minRow = Math.min(...rowIndexes);
      const minCol = Math.min(...colIndexes);
  
      setTableRows(prevRows => {
        let updatedRows = [...prevRows];
        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < rows[r].length; c++) {
            const rowIndex = minRow + r;
            const colIndex = minCol + c;
            if (
              rowIndex < updatedRows.length &&
              colIndex < visibleEditableColumns.length
            ) {
              const columnId = visibleEditableColumns[colIndex];
              // Use the same logic as updateData to apply formulas
              let updatedRow = { ...updatedRows[rowIndex], [columnId]: rows[r][c] };
  
              // --- Apply your formulas here (copy from updateData) ---
              // Example (add all your formula logic here):
              const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;
              const lib_vol_for_2nm = parseFloat(updatedRow.lib_vol_for_2nm) || 0;
              const per_rxn_gdna = parseFloat(updatedRow.per_rxn_gdna) || 0;
              const volume = parseFloat(updatedRow.volume) || 0;
              const qubit_lib_qc_ng_ul = parseFloat(updatedRow.qubit_lib_qc_ng_ul) || 0;
              const one_tenth_of_nm_conc = parseFloat(updatedRow.one_tenth_of_nm_conc) || 0;
              const size = parseFloat(updatedRow.size) || 0;
              const nm_conc = parseFloat(updatedRow.nm_conc) || 0;
              const qubit_dna = parseFloat(updatedRow.qubit_dna) || 0;
  
              if (columnId === "lib_qubit" || columnId === "total_vol_for_2nm") {
                const lib_qubit = parseFloat(updatedRow.lib_qubit) || 0;
                const size = parseFloat(updatedRow.size) || 0;
                const nm_conc = lib_qubit > 0 ? (lib_qubit / (size * 660)) * 1000 : 0;
  
                updatedRow.nm_conc = parseFloat(nm_conc.toFixed(2));
  
                const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;
  
                if (nm_conc > 0 && total_vol_for_2nm > 0) {
                  updatedRow.lib_vol_for_2nm = parseFloat(((3 * total_vol_for_2nm) / nm_conc).toFixed(2));
                  if (updatedRow.lib_vol_for_2nm > total_vol_for_2nm) {
                    updatedRow.lib_vol_for_2nm = total_vol_for_2nm;
                  }
                  updatedRow.nfw_volu_for_2nm = parseFloat((total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2));
                } else {
                  updatedRow.lib_vol_for_2nm = 0;
                  updatedRow.nfw_volu_for_2nm = total_vol_for_2nm;
                }
              }
  
              if (columnId === 'pool_conc' || columnId === 'size') {
                const poolConc = parseFloat(updatedRow.pool_conc) || 0;
                updatedRow.nm_conc = size > 0 ? ((poolConc / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
              }
  
              if (qubit_lib_qc_ng_ul) {
                updatedRow.lib_vol_for_hyb = parseFloat(200 / qubit_lib_qc_ng_ul).toFixed(2)
              }
  
              if (columnId === "size") {
                updatedRow.one_tenth_of_nm_conc = nm_conc > 0 ? (parseFloat((nm_conc / 10).toFixed(2))) : "";
              }
              if (qubit_dna || per_rxn_gdna) {
                updatedRow.gdna_volume_3x = qubit_dna > 0 ? Math.ceil((per_rxn_gdna / qubit_dna) * 3) : "";
              }
  
              if (columnId === "volume" || columnId === "gdna_volume_3x") {
                const gdna_volume_3x = parseFloat(updatedRow.gdna_volume_3x) || 0;
                updatedRow.nfw = volume > 0 ? volume - gdna_volume_3x : "";
              }
  
              if (columnId === "qubit_lib_qc_ng_ul") {
                updatedRow.stock_ng_ul = qubit_lib_qc_ng_ul > 0 ? qubit_lib_qc_ng_ul * 10 : "";
                updatedRow.lib_vol_for_hyb = (200 / qubit_lib_qc_ng_ul).toFixed(2);
              }
              if (columnId === "stock_ng_ul") {
                const stock = parseFloat(rows[r][c]) || 0;
                updatedRow.stock_ng_ul = stock;
              }
  
              if (columnId === "qubit_lib_qc_ng_ul") {
                updatedRow.pooling_volume = qubit_lib_qc_ng_ul > 0 ? (200 / qubit_lib_qc_ng_ul).toFixed(2) : "";
              }
  
              if (columnId === 'pool_conc' || columnId === 'size') {
                updatedRow.one_tenth_of_nm_conc = updatedRow.nm_conc > 0 ? (parseFloat((updatedRow.nm_conc / 10).toFixed(2))) : "";
              }
  
              if (columnId === "one_tenth_of_nm_conc" || columnId === "total_vol_for_2nm" || columnId === "lib_vol_for_2nm") {
                updatedRow.total_vol_for_2nm = one_tenth_of_nm_conc > 0 ? (one_tenth_of_nm_conc * lib_vol_for_2nm / 2).toFixed(2) : "";
                updatedRow.nfw_volu_for_2nm = total_vol_for_2nm > 0 ? (updatedRow.total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2) : "";
              }
              // --- End formula logic ---
  
              updatedRows[rowIndex] = updatedRow;
            }
          }
        }
        return updatedRows;
      });
      e.preventDefault();
    };
  
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [selectedCells, editableColumns]);

  useEffect(() => {
    const handleCopy = (e) => {
      if (!selectedCells.length) return;

      // Sort cells by rowIndex, then columnId
      const sortedCells = [...selectedCells].sort((a, b) => {
        if (a.rowIndex === b.rowIndex) {
          return a.columnId.localeCompare(b.columnId);
        }
        return a.rowIndex - b.rowIndex;
      });

      // Group cells by rowIndex
      const grouped = sortedCells.reduce((acc, cell) => {
        if (!acc[cell.rowIndex]) acc[cell.rowIndex] = [];
        acc[cell.rowIndex].push(cell);
        return acc;
      }, {});

      // Build clipboard string
      const lines = Object.keys(grouped)
        .sort((a, b) => a - b)
        .map(rowIdx =>
          grouped[rowIdx]
            .sort((a, b) => a.columnId.localeCompare(b.columnId))
            .map(cell => tableRows[cell.rowIndex][cell.columnId] ?? "")
            .join('\t')
        );

      const clipboardString = lines.join('\n');
      e.clipboardData.setData('text/plain', clipboardString);
      e.preventDefault();
    };

    window.addEventListener("copy", handleCopy);
    return () => window.removeEventListener("copy", handleCopy);
  }, [selectedCells, tableRows]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if Delete or Backspace is pressed and cells are selected
      if (
        selectedCells.length > 0 &&
        (e.key === "Delete" || e.key === "Backspace") &&
        // Don't trigger if an input is focused (let the input handle it)
        document.activeElement.tagName !== "INPUT"
      ) {
        setTableRows(prevRows =>
          prevRows.map((row, rowIndex) => {
            const updatedRow = { ...row };
            selectedCells.forEach(cell => {
              if (cell.rowIndex === rowIndex) {
                updatedRow[cell.columnId] = "";
              }
            });
            return updatedRow;
          })
        );
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData'));
    if (storedData) {
      const testNames = Object.keys(storedData); // Extract keys from the stored data
      setGetTheTestNames(testNames); // Update state with test names

      if (testNames.length > 0) {
        const defaultTestName = testNames[0];
        setTestName(defaultTestName);
        if (Array.isArray(storedData[defaultTestName])) {
          setTableRows(storedData[defaultTestName]);
          setPooledRowData([]);
        } else {
          setTableRows(storedData[defaultTestName].rows || []);
          setPooledRowData(storedData[defaultTestName].pools || []);
        }
      }
    }
  }, []);

  const handleTestNameSelection = async (selectedTestName) => {
    setTestName(selectedTestName);
    setSelectedSampleIndicator(selectedTestName);
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};

    // Always show local data if it exists
    if (storedData && storedData[selectedTestName]) {
      if (Array.isArray(storedData[selectedTestName])) {
        setTableRows(storedData[selectedTestName]);
        setPooledRowData([]);
      } else {
        setTableRows(storedData[selectedTestName].rows || []);
        setPooledRowData(storedData[selectedTestName].pools || []);
      }
      return; // Do not fetch or overwrite with API data
    }

    // If no local data, fetch from API
    try {
      const allSampleIds = Object.values(storedData)
        .flatMap(arr => arr.map(row => row.sample_id))
        .filter(Boolean);
      const response = await axios.get(`/api/pool-data`, {
        params: {
          hospital_name: user.hospital_name,
          application: selectedTestName,
          sample_id: allSampleIds.join(','),
        },
      });
      if (response.data[0].status === 200) {
        const poolData = response.data[0].data;
        if (poolData && poolData.length > 0) {
          const newData = poolData.reduce((acc, row) => {
            const testName = row.test_name;
            if (!acc[testName]) acc[testName] = [];
            acc[testName].push(row);
            return acc;
          }, {});
          setTableRows(newData[selectedTestName] || []);
          // Only update localStorage if there was no local data
          if (!storedData[selectedTestName] || storedData[selectedTestName].length === 0) {
            const mergedData = { ...storedData, ...newData };
            localStorage.setItem('libraryPreparationData', JSON.stringify(mergedData));
          }
        } else {
          setTableRows([]);
          setMessage(1);
        }
      }
    } catch (error) {
      console.error("Error in handleTestNameSelection:", error);
      toast.error("An error occurred while selecting the test name.");
    }
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData'));
    if (storedData) {
      const testNames = Object.keys(storedData); // Extract keys from the stored data
      setGetTheTestNames(testNames); // Update state with test names

      // Set default testName and tableRows based on the first key
      if (testNames.length > 0) {
        const defaultTestName = testNames[0];
        setTestName(defaultTestName);
        setTableRows(storedData[defaultTestName]);
      }
    }
  }, []);

  const handleSaveAll = async () => {
    setProcessing(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
      const hospital_name = user.hospital_name;

      // Prepare an array of promises for all testNames
      const savePromises = Object.entries(storedData).map(([testName, data]) => {
        let rows = [];
        if (Array.isArray(data)) {
          rows = data;
        } else if (data && Array.isArray(data.rows)) {
          rows = data.rows;
        }
        return axios.post('/api/pool-data', {
          hospital_name,
          testName,
          rows,
        });
      });

      const results = await Promise.all(savePromises);

      // Check if all were successful
      const allSuccess = results.every(res => res.data[0]?.status === 200);

      if (allSuccess) {
        toast.success("All data saved successfully!");
        setProcessing(false);
        // localStorage.removeItem('libraryPreparationData');
        // setMessage(1); // Set message to indicate no data available
        // setTableRows([]);
        // setGetTheTestNames([]);
      } else {
        setProcessing(false);
        toast.error("Some data could not be saved. Please check and try again.");
      }
    } catch (error) {
      console.error("Error saving all data:", error);
      toast.error("An error occurred while saving all data.");
      setProcessing(false);
    }
  };

  const selectedRows = table.getRowModel().rows.filter(r => rowSelection[r.id]);
  const lastSelectedIndex = selectedRows.length > 0
    ? selectedRows[selectedRows.length - 1].index
    : null;
  const currentSelectedIndexes = selectedRows.map(r => r.index);

  useEffect(() => {
    setCurrentSelection(currentSelectedIndexes);
  }, [rowSelection]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
    if (storedData[testName]) {
      if (Array.isArray(storedData[testName])) {
        setTableRows(storedData[testName]);
        setPooledRowData([]);
      } else {
        setTableRows(storedData[testName].rows || []);
        setPooledRowData(storedData[testName].pools || []);
      }
    }
  }, [testName]);

  useEffect(() => {
    // Save pooledColumns for each pool in localStorage under the current testName
    if (!testName) return;
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
    // Save both tableRows and pooledRowData under the same testName key
    storedData[testName] = {
      rows: tableRows,
      pools: pooledRowData,
    };
    localStorage.setItem('libraryPreparationData', JSON.stringify(storedData));
  }, [pooledRowData, tableRows, testName]);

  return (
    <div className="p-4 ">
      {!message ?
        (<>
          <div className="mb-4 flex items-center gap-4 overflow-x-auto ">
            <Tabs value={testName} className="w-full rounded-lg ">
              <TabsList className="flex flex-nowrap bg-white dark:bg-gray-800 ">
                {getTheTestNames.map((testName, index) => (
                  <TabsTrigger
                    key={index}
                    value={testName}
                    onClick={() => handleTestNameSelection(testName)}
                    className={`text-sm px-4 py-2 cursor-pointer font-bold rounded-lg data-[state=active]:bg-orange-400 data-[state=active]:text-white
                      }`}
                  >
                    {testName}
                  </TabsTrigger>
                ))}
                {/* {getTheTestNames.length === 0 && (
                  <span className="text-sm px-4 py-2 text-white font-bold">
                    No Test Names Available
                  </span>
                )} */}
              </TabsList>
            </Tabs>
          </div>

          {selectedCells.length > 1 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow z-50">
              <input
                type="text"
                placeholder="Bulk value"
                value={bulkValue}
                onChange={e => setBulkValue(e.target.value)}
                className="border p-2"
              />
              <Button
                onClick={() => {
                  setTableRows(prevRows =>
                    prevRows.map((row, rowIndex) => {
                      const updatedRow = { ...row };
                      selectedCells.forEach(cell => {
                        if (cell.rowIndex === rowIndex) {
                          updatedRow[cell.columnId] = bulkValue;
                        }
                      });
                      return updatedRow;
                    })
                  );
                  setBulkValue("");
                }}
              >
                Apply to Selected
              </Button>
            </div>
          )}

          <div className="">
            {/* Table */}
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full whitespace-nowrap" style={{ maxWidth: 'calc(100vw - 60px)' }}>
              <div className="overflow-y-auto" style={{ maxHeight: 700 }}>
                <table className="min-w-full border-collapse table-auto">
                  <thead className="bg-orange-100 dark:bg-gray-800 sticky top-0 z-30">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className="cursor-pointer px-4 py-2 text-left border-b border-gray-200 sticky top-0 z-30 bg-orange-100 dark:bg-gray-800 whitespace-nowrap"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody>
                    {table.getRowModel().rows.map((row, rowIndex) => {
                      const pool = pooledRowData.find(pool => pool.sampleIndexes.includes(rowIndex));
                      const isFirstOfPool = pool && rowIndex === Math.min(...pool.sampleIndexes);

                      const isSelected = currentSelection.includes(rowIndex);
                      const isFirstSelected = isSelected && rowIndex === Math.min(...currentSelection);

                      return (
                        <React.Fragment key={row.id}>
                          <tr>
                            {columns.map((col, colIdx) => {
                              // Pooled (existing) inputs
                              if (pooledColumns.includes(col.accessorKey) && pool) {
                                if (isFirstOfPool) {
                                  return (
                                    <td
                                      key={col.accessorKey}
                                      rowSpan={pool.sampleIndexes.length}
                                      className="align-middle bg-slate-100 px-2 py-1 border border-gray-300"
                                    >
                                      <input
                                        className="border border-orange-300 rounded p-1 w-[200px] bg-gray-100"
                                        placeholder={col.header || col.accessorKey}
                                        value={pool.values[col.accessorKey] || ""}
                                        onChange={e => {
                                          const value = e.target.value;
                                          setPooledRowData(prev =>
                                            prev.map(p => {
                                              if (p !== pool) return p;
                                              const updated = { ...p.values, [col.accessorKey]: value };

                                              // --- Formula logic ---
                                              const poolConc = parseFloat(updated.pool_conc) || 0;
                                              const size = parseFloat(updated.size) || 0;
                                              updated.nm_conc = (size > 0 && poolConc > 0)
                                                ? ((poolConc / (size * 660)) * 1000000).toFixed(2)
                                                : "";

                                              const nmConc = parseFloat(updated.nm_conc) || 0;
                                              updated.one_tenth_of_nm_conc = (nmConc > 0) ? (nmConc / 10).toFixed(2) : "";

                                              const libVolFor2nm = parseFloat(updated.lib_vol_for_2nm) || 0;
                                              updated.total_vol_for_2nm = (updated.one_tenth_of_nm_conc && libVolFor2nm)
                                                ? (parseFloat(updated.one_tenth_of_nm_conc) * libVolFor2nm / 2).toFixed(2)
                                                : "";

                                              const totalVolFor2nm = parseFloat(updated.total_vol_for_2nm) || 0;
                                              updated.nfw_volu_for_2nm = (totalVolFor2nm && libVolFor2nm)
                                                ? (totalVolFor2nm - libVolFor2nm).toFixed(2)
                                                : "";

                                              return { ...p, values: updated };
                                            })
                                          );
                                        }}
                                      />
                                    </td>
                                  );
                                }
                                return null; // Covered by rowspan
                              }

                              // Pooled (new) inputs
                              if (
                                pooledColumns.includes(col.accessorKey) &&
                                showPooledFields &&
                                isFirstSelected
                              ) {
                                return (
                                  <td
                                    key={col.accessorKey}
                                    rowSpan={currentSelection.length}
                                    className="align-middle bg-slate-50 px-2 py-1 border border-gray-300"
                                  >
                                    <input
                                      className="border border-orange-300 rounded p-1 w-[200px] bg-gray-100"
                                      placeholder={col.header || col.accessorKey}
                                      value={pool?.values[col.accessorKey] || ""}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setPooledRowData(prev =>
                                          prev.map(p => {
                                            if (p !== pool) return p;
                                            const updated = { ...p.values, [col.accessorKey]: value };

                                            // --- Formula logic ---
                                            const poolConc = parseFloat(updated.pool_conc) || 0;
                                            const size = parseFloat(updated.size) || 0;
                                            updated.nm_conc = (size > 0 && poolConc > 0)
                                              ? ((poolConc / (size * 660)) * 1000000).toFixed(2)
                                              : "";

                                            const nmConc = parseFloat(updated.nm_conc) || 0;
                                            updated.one_tenth_of_nm_conc = (nmConc > 0) ? (nmConc / 10).toFixed(2) : "";

                                            const libVolFor2nm = parseFloat(updated.lib_vol_for_2nm) || 0;
                                            updated.total_vol_for_2nm = (updated.one_tenth_of_nm_conc && libVolFor2nm)
                                              ? (parseFloat(updated.one_tenth_of_nm_conc) * libVolFor2nm / 2).toFixed(2)
                                              : "";

                                            const totalVolFor2nm = parseFloat(updated.total_vol_for_2nm) || 0;
                                            updated.nfw_volu_for_2nm = (totalVolFor2nm && libVolFor2nm)
                                              ? (totalVolFor2nm - libVolFor2nm).toFixed(2)
                                              : "";

                                            return { ...p, values: updated };
                                          })
                                        );
                                      }}
                                    />
                                  </td>
                                );
                              }

                              if (
                                pooledColumns.includes(col.accessorKey) &&
                                ((showPooledFields && isSelected) || pool)
                              ) {
                                return null; // skip cell covered by rowspan
                              }

                              // Default cell render
                              return (
                                <td key={col.accessorKey} className="px-4 py-1 border-b border-gray-100">
                                  {flexRender(
                                    col.cell,
                                    row.getVisibleCells().find(c => c.column.id === col.accessorKey)?.getContext?.() || {}
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {rowIndex === Math.max(...currentSelection) && currentSelection.length > 0 && !showPooledFields && (
                            <tr>
                              <td colSpan={columns.length} className="py-2 px-4">
                                <Button
                                  onClick={handleDone}
                                  className=" text-white text-sm px-4 py-1 rounded bg-black"
                                >
                                  Done
                                </Button>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          <Button
            type="button"
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700 mt-5 text-white cursor-pointer ml-2 min-w-[120px] h-12"
          >
            Save All
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-gray-700 hover:bg-gray-800 mt-5 text-white cursor-pointer min-w-[120px] h-12">
            Save
          </Button>
          <Button
            type="button"
            onClick={() => { setDialogOpen(true); }}
            className="bg-red-500 hover:bg-red-600 mt-5 text-white cursor-pointer ml-2 min-w-[120px] h-12"
          >
            Remove
          </Button>
        </>
        )
        :
        (
          <div className="text-center text-red-500  mb-4">
            No data available for Library Preparation. Please add some from
            <span
              className="cursor-pointer underline font-bold"
              onClick={() => dispatch(setActiveTab("processing"))}> Processing Tab</span>
          </div>
        )
      }


      {/* Column Selector Dropdown */}
      <DialogBox isOpen={DialogOpen} onClose={() => setDialogOpen(false)} selectedTestName={testName} />      <ToastContainer />
    </div>
  )
}

export default LibraryPrepration

const DialogBox = ({ isOpen, onClose, selectedTestName }) => {
  const dispatch = useDispatch();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Remove from Library Preparation?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <span className="text-normal text-black dark:text-white">
            Do you want to remove the data of <span className="font-bold text-lg">{selectedTestName}</span> from Library Preparation? This action cannot be undone.
          </span>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
              if (storedData && selectedTestName && storedData[selectedTestName]) {
                delete storedData[selectedTestName];
                localStorage.setItem('libraryPreparationData', JSON.stringify(storedData));
              }
              dispatch(setActiveTab("processing"));
              onClose();
            }}
            className="ml-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
