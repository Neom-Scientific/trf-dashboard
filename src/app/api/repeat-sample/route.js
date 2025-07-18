import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

// List all fields from SampleRegistration.jsx here
const sampleRegistrationFields = [
    "sample_id", "hospital_name", "hospital_id", "doctor_name", "dept_name", "doctor_mobile", "email",
    "patient_name", "DOB", "age", "sex", "patient_mobile", "ethnicity", "father_mother_name", "address",
    "city", "state", "country", "client_id", "client_name", "spouse_name", "patient_email", "registration_date", "sample_type", "collection_date_time", "sample_date",
    "specimen_quality", "prority", "storage_condition", "vial_received", "test_name",
    "systolic_bp", "diastolic_bp", "total_cholesterol", "hdl_cholesterol", "ldl_cholesterol", "diabetes",
    "smoker", "hypertension_treatment", "statin", "aspirin_therapy", "remarks", "clinical_history", "trf"
];

const dateFields = [
    "DOB", "collection_date_time", "sample_date", "created_at", "updated_at", "seq_run_date", "report_realising_date", "registration_date", "lib_prep_date"
    // add any other date columns here
];

const integerFields = [
    "age", "systolic_bp", "diastolic_bp", "total_cholesterol", "hdl_cholesterol", "ldl_cholesterol",
    "tat_days", "gb_per_sample", "total_gb_available", "total_gb_required", "total_volume_next_seq_550", "count"
];

// List all pool_info and run_setup columns here
const poolAndRunSetupFields = [
    "conc_rxn", "i5_index_reverse", "i7_index", "lib_qubit", "nm_conc", "nfw_volu_for_2nm",
    "total_vol_for_2nm", "barcode", "lib_vol_for_2nm", "sample_id", "test_name", "qubit_dna",
    "per_rxn_gdna", "volume", "gdna_volume_3x", "nfw", "plate_designation", "well",
    "qubit_lib_qc_ng_ul", "stock_ng_ul", "lib_vol_for_hyb", "gb_per_sample", "pool_no", "size",
    "i5_index_forward", "sample_volume", "pooling_volume", "pool_conc", "one_tenth_of_nm_conc",
    "data_required", "hospital_name", "run_id", "lib_prep_date", "internal_id", "batch_id",
    "vol_for_40nm_percent_pooling", "volume_from_40nm_for_total_25ul_pool", "done_by"
];

const floatFields = [
    "pool_conc", "one_tenth_of_nm_conc", "lib_vol_for_2nm", "nfw_volu_for_2nm",
    "total_vol_for_2nm", "lib_vol_for_hyb", "data_required", "sample_volume", "pooling_volume", "buffer_volume_next_seq_550", "dinatured_lib_next_seq_550", "lib_required_next_seq_550", "loading_conc_1000_2000", "total_volume_2nm_next_seq_550", "final_pool_vol_ul", "ht_buffer_next_seq_1000_2000", "vol_for_40nm_percent_pooling", "volume_from_40nm_for_total_25ul_pool"
    // Add any other float/double columns in your schema
];

// Helper to generate new internal_id (YYYYNNNNN)
async function generateInternalId() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const year = new Date().getFullYear();
        const { rows } = await client.query(
            `SELECT internal_id FROM master_sheet WHERE internal_id LIKE $1 ORDER BY internal_id DESC LIMIT 1 FOR UPDATE`,
            [`${year}%`]
        );

        let nextSeq = 1;
        if (rows.length > 0 && rows[0].internal_id) {
            const lastSeq = parseInt(rows[0].internal_id.slice(4), 10);
            nextSeq = lastSeq + 1;
        }

        let newId = `${year}${String(nextSeq).padStart(5, "0")}`;

        // Just to double-check one last time
        const { rows: check } = await client.query(`SELECT 1 FROM master_sheet WHERE internal_id = $1`, [newId]);
        if (check.length > 0) {
            throw new Error(`internal_id ${newId} already exists`);
        }

        await client.query('COMMIT');
        return newId;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}


export async function POST(request) {
    const body = await request.json();
    const { sample_id, repeat_type, exceptional, user_email } = body;
    let response = [];

    try {
        // Fetch the original sample
        const { rows } = await pool.query(
            `SELECT * FROM master_sheet WHERE sample_id = $1 ORDER BY registration_date DESC LIMIT 1`,
            [sample_id]
        );
        if (rows.length === 0) {
            response.push({ status: 404, message: "Sample not found" });
            return NextResponse.json(response);
        }
        const original = rows[0];

        let newSample = {};

        // Always copy SampleRegistration fields
        sampleRegistrationFields.forEach(field => {
            let value = original[field];
            if (dateFields.includes(field)) {
                newSample[field] = value ? value : null;
            } else if (integerFields.includes(field)) {
                newSample[field] = (value === "" || value === null || value === undefined) ? null : Number(value);
            } else if (floatFields.includes(field)) {
                newSample[field] = (value === "" || value === null || value === undefined) ? null : parseFloat(value);
            } else {
                newSample[field] = value ?? "";
            }
        });

        if (repeat_type === "less_qc") {
            // Keep internal_id, pool_no, batch_id
            newSample.internal_id = await generateInternalId();
            newSample.reference_internal_id = original.internal_id;
            newSample.pool_no = original.pool_no;
            newSample.batch_id = original.batch_id;
            // Reset all pool_info/run_setup fields except those above
            poolAndRunSetupFields.forEach(field => {
                if (!["internal_id", "pool_no", "batch_id", "test_name", "sample_id"].includes(field)) {
                    if (floatFields.includes(field)) {
                        newSample[field] = null;
                    } else if (integerFields.includes(field)) {
                        newSample[field] = null;
                    } else if (dateFields.includes(field)) {
                        newSample[field] = null;
                    } else {
                        if (floatFields.includes(field)) {
                            newSample[field] = null;
                        } else {
                            newSample[field] = "";
                        }
                    }
                }
            });
        } else if (repeat_type === "less_data" || exceptional) {
            // Generate new internal_id, pool_no, batch_id
            newSample.internal_id = await generateInternalId();
            newSample.pool_no = null;
            newSample.batch_id = null;
            console.log('newsample.internal_id', newSample.internal_id);

            // Only empty the specified columns, copy others from original
            const emptyFields = [
                "lib_vol_for_hyb", "data_required", "pool_conc", "size", "nm_conc",
                "one_tenth_of_nm_conc", "lib_vol_for_2nm", "nfw_volu_for_2nm", "total_vol_for_2nm"
            ];

            poolAndRunSetupFields.forEach(field => {
                if (field === "internal_id") {
                    return; // 🔒 Don't overwrite generated internal_id
                }
                if (["pool_no", "batch_id"].includes(field)) {
                    newSample[field] = null;
                    return;
                }
                if (repeat_type === "less_data" && !exceptional) {
                    if (emptyFields.includes(field)) {
                        if (floatFields.includes(field) || integerFields.includes(field) || dateFields.includes(field)) {
                            newSample[field] = null;
                        } else {
                            newSample[field] = "";
                        }
                    } else {
                        let value = original[field];
                        if (dateFields.includes(field)) {
                            newSample[field] = value ? value : null;
                        } else if (integerFields.includes(field)) {
                            newSample[field] = (value === "" || value === null || value === undefined) ? null : Number(value);
                        } else if (floatFields.includes(field)) {
                            newSample[field] = (value === "" || value === null || value === undefined) ? null : parseFloat(value);
                        } else {
                            newSample[field] = value ?? "";
                        }
                    }
                } else {
                    if (sampleRegistrationFields.includes(field) || field === "internal_id") {
                        // Already copied above, skip
                        return;
                    }
                    // For exceptional, empty all pool/run fields
                    if (floatFields.includes(field) || integerFields.includes(field) || dateFields.includes(field)) {
                        newSample[field] = null;
                    } else {
                        newSample[field] = "";
                    }
                }
            });
        } else {
            response.push({ status: 400, message: "Invalid repeat type" });
            return NextResponse.json(response);
        }

        // Remove id, created_at, updated_at if present
        delete newSample.id;
        delete newSample.created_at;
        delete newSample.updated_at;

        // Insert new sample into master_sheet
        const columns = Object.keys(newSample);
        const values = columns.map((col) => newSample[col]);
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(", ");

        console.log('columns', columns);
        console.log('columns.internal_id', columns.includes('internal_id'));
        console.log('values', values);
        console.log('values.internal_id', values.includes(newSample.internal_id));

        const insertQuery = `
      INSERT INTO master_sheet (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *;
    `;
        const insertResult = await pool.query(insertQuery, values);

        // Optionally, add audit log
        await pool.query(
            `INSERT INTO audit_logs (sample_id, comments, changed_by, changed_at) VALUES ($1, $2, $3, $4)`,
            [
                newSample.sample_id,
                `Repeat sample created (${repeat_type}${exceptional ? " - exceptional" : ""})`,
                user_email,
                new Date(),
            ]
        );

        response.push({
            status: 200,
            message: "Repeat sample created",
            data: insertResult.rows[0],
        });
        return NextResponse.json(response);
    } catch (err) {
        console.error(err);
        response.push({ status: 500, message: "Server error" });
        return NextResponse.json(response);
    }
}