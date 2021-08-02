import React, { useContext } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import Head from "next/head";
import NotifyContext from "../contexts/notify-context";

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<LoginForm>();
  const notify = useContext(NotifyContext);

  // form submit
  const onSubmit = async (values: LoginForm) => {
    try {
      const request = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(values),
      });

      if (request.ok) {
        notify.NewAlert({ msg: "User authenticated", status: "success" });
      } else {
        const { err }: { err: string } = await request.json();

        notify.NewAlert({
          msg: "User authentication failed",
          description: err || "",
          status: "error",
        });
      }
    } catch (error) {
      notify.NewAlert({
        msg: "Something is wrong",
        description: error,
        status: "error",
      });
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Center w="100vw" h="100vh">
        <Container width="350px">
          <Text align="center" paddingY="2" fontSize="lg">
            Login
          </Text>
          <Box
            backgroundColor="white"
            paddingY="2"
            paddingX="4"
            boxShadow="lg"
            rounded="lg"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl>
                <FormLabel htmlFor="username">Username</FormLabel>
                <Input
                  {...register("username", { required: true })}
                  placeholder="username"
                />
                {errors.username && (
                  <FormHelperText>This field is required</FormHelperText>
                )}
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <Input
                  {...register("password", { required: true })}
                  placeholder="password"
                  type="password"
                />
                {errors.password && (
                  <FormHelperText>This field is required</FormHelperText>
                )}
              </FormControl>

              <Flex direction="column">
                <Button type="submit" m="2" colorScheme="teal">
                  Login
                </Button>
                <Button m="2" size="sm">
                  Forgot my password
                </Button>
              </Flex>
            </form>
          </Box>
        </Container>
      </Center>
    </>
  );
};

export default LoginPage;