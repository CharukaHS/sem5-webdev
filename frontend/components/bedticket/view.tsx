import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";

import NewRecord from "components/bedticket/new";

import AuthContext from "contexts/auth-context";
import NotifyContext from "contexts/notify-context";

import { ApiRequest } from "util/request";

import { DB } from "@sem5-webdev/types";

interface bedticketProps {
  bid: number;
  pid: number;
  state?: React.Dispatch<
    React.SetStateAction<DB.Patient.Data | undefined> // state is only passing in active bed ticket
  >;
}

const BedTicket: React.FC<bedticketProps> = ({ bid, pid, state }) => {
  const [entries, setentries] = useState<DB.Patient.BedTicketEntry[]>([]);

  const auth = useContext(AuthContext);
  const notify = useContext(NotifyContext);

  const FetchEntries = async () => {
    const { success, err, data } = await ApiRequest<
      DB.Patient.BedTicketEntry[]
    >({
      path: `bedtickets/${bid}`,
      method: "GET",
      token: auth.token,
    });

    if (!success || err) {
      notify.NewAlert({
        msg: "Fetching entries failed",
        description: err,
        status: "error",
      });

      return;
    }

    if (!data) {
      notify.NewAlert({
        msg: "Request didn't came with expected response",
        status: "error",
      });

      return;
    }

    // update state
    setentries(data);
  };

  const DischargeBedticket = async () => {
    if (!state) {
      notify.NewAlert({
        msg: "Un authorized function",
        description:
          "Looks like you are discharging patient who is already discharged",
        status: "error",
      });
      return;
    }

    const { success, err, data } = await ApiRequest<
      DB.Patient.BedTicketEntry[]
    >({
      path: `bedtickets/close/${pid}`,
      method: "POST",
      token: auth.token,
    });

    if (!success || err) {
      notify.NewAlert({
        msg: "Discharging failed",
        description: err,
        status: "error",
      });

      return;
    }

    if (!data) {
      notify.NewAlert({
        msg: "Request didn't came with expected response",
        status: "error",
      });

      return;
    }

    notify.NewAlert({
      msg: "Patient discharged successfully",
      status: "success",
    });

    // update patient data in client side
    state((prev) =>
      prev ? { ...prev, current_bedticket: undefined } : undefined
    );
  };

  // onMount
  useEffect(() => {
    (async () => {
      await FetchEntries();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isOpen: nr_isOpen,
    onOpen: nr_onOpen,
    onClose: nr_onClose,
  } = useDisclosure();
  return (
    <>
      <Table>
        <TableCaption>Bed ticket entries</TableCaption>

        <Thead>
          <Tr>
            <Th></Th>
            <Th>Type</Th>
            <Th>Notes</Th>
            <Th>Timestamp</Th>
          </Tr>
        </Thead>

        <Tbody>
          {entries.map((e) => {
            return (
              <Tr key={`${bid}-${e.id}`}>
                <Td>
                  <Badge>{e.category?.toUpperCase()}</Badge>
                </Td>
                <Td>{e.type || "N/A"}</Td>
                <Td>{e.note || " "}</Td>
                <Td>{e.created_at}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {state && (
        <>
          <ButtonGroup mt={2}>
            <Button colorScheme="facebook" onClick={nr_onOpen}>
              Add New Record
            </Button>
            <Button colorScheme="orange" onClick={DischargeBedticket}>
              Discharge
            </Button>
          </ButtonGroup>
          <NewRecord
            isOpen={nr_isOpen}
            onClose={nr_onClose}
            refresh={FetchEntries}
            bid={bid}
          />
        </>
      )}
    </>
  );
};

export default BedTicket;
