import db from "database/pg";
import { DecryptData, EncryptData } from "util/crypto";
import { logger } from "util/logger";

import { DB } from "@sem5-webdev/types";

/**
 * Create new bed ticket
 *
 * @param {string} pid
 * @return {*}  {Promise<{ err?: string }>}
 */
export default async (pid: string): Promise<{ err?: string }> => {
  const id = parseInt(pid);
  if (isNaN(id)) {
    return { err: "ID is not a number" };
  }

  const trx = await db.connect();
  try {
    await trx.query("BEGIN");

    // fetch patient data from database
    const q1 = await trx.query("SELECT data FROM patients.info WHERE id=$1", [
      id,
    ]);

    if (q1.rowCount === 0) {
      return { err: "User ID not found" };
    }

    // decrypting data
    const decrypted = DecryptData<DB.Patient.Data>(q1.rows[0].data);

    if (decrypted.current_bedticket) {
      return { err: "User already has an active bed ticket" };
    }

    // save bed ticket in database
    const q2 = await trx.query(
      "INSERT INTO patients.bedtickets DEFAULT VALUES RETURNING id "
    );

    // storing bed ticket
    const bid: number = q2.rows[0].id;

    // updating patient document
    decrypted.current_bedticket = bid;

    // bedtickets array doesnt exists initially
    if (!decrypted.bedtickets) {
      decrypted.bedtickets = [{ admission_date: Date.now(), id: bid }];
    } else {
      decrypted.bedtickets.push({ admission_date: Date.now(), id: bid });
    }

    // encrypting updated patient document
    const encrypted = EncryptData(JSON.stringify(decrypted));

    // updating database
    await trx.query("UPDATE patients.info SET data=$1 WHERE id=$2", [
      encrypted,
      pid,
    ]);

    // commiting
    await trx.query("COMMIT");
  } catch (error) {
    // rollback
    await trx.query("ROLLBACK");

    logger("Error occured while HandleNewBedTicket transaction", "error");
    throw error;
  } finally {
    trx.release();
  }
  return { err: undefined };
};
