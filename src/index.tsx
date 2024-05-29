import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { Theme } from "./assets/theme";

const client = new QueryClient();

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap');
  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
  }
  body {
    font-family: "Source Sans 3", sans-serif;
  }
  ul,li {
    list-style:none;
  }
  a{
    text-decoration:none;
    color:inherit;
  }
`;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <QueryClientProvider client={client}>
    <ThemeProvider theme={Theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
