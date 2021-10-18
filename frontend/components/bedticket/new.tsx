import React, { useContext } from "react";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import AuthContext from "contexts/auth-context";
import NotifyContext from "contexts/notify-context";

import { ApiRequest } from "util/request";

import type { API, DB } from "@sem5-webdev/types";

interface newProps {
  isOpen: boolean;
  onClose: () => void;
  bid?: number;
  refresh: () => Promise<void>;
}

const NewRecord: React.FC<newProps> = ({ isOpen, onClose, bid, refresh }) => {
  const auth = useContext(AuthContext);
  const notify = useContext(NotifyContext);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<DB.Patient.BedTicketEntry, "created_at">>();

  const OnSubmit = async (value: DB.Patient.BedTicketEntry) => {
    const { success, err } = await ApiRequest({
      path: `bedtickets/${bid}`,
      method: "POST",
      obj: value,
      token: auth.token,
    });

    if (!success) {
      notify.NewAlert({
        msg: "Invalid form data",
        description: err,
        status: "error",
      });
      return;
    }

    notify.NewAlert({
      msg: "New entry record saved",
      status: "success",
    });

    // refetch entries
    // TODO: combine with add new request
    await refresh();

    reset();

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Add New Entry</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit(OnSubmit)}>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Entry type</FormLabel>
              <Select
                placeholder="Select record type"
                {...register("category", { required: true })}
              >
                <option value="diagnosis">Diagnosis</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </Select>
              {errors.type && (
                <FormHelperText>This field is required</FormHelperText>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea {...register("note")} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" colorScheme="facebook" mr={3}>
              Submit
            </Button>
            <Button
              type="reset"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default NewRecord;
