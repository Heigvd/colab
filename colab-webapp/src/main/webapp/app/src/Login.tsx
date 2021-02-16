/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from "react";
import { css, cx } from "@emotion/css";

import GhLogo from "./images/github.svg";
import AlbaLogo from "./images/logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";

export function LoginForm(props: { redirectTo?: string }) {
  return (
    <div id="main">
      <div>
        <div
          className={cx(
            css({
              margin: "100px auto"
            })
          )}
        >
          <div
            className={cx(
              css({
                display: "flex"
              })
            )}
          >
            <AlbaLogo
              className={css({
                height: "110px",
                width: "200px",
                padding: "10px"
              })}
            />
            <h1
              className={css({
                padding: "10px",
                color: "white"
              })}
            >
              Les Courses
            </h1>
          </div>
          <div
            className={css({
              textAlign: "center",
              padding: "10px"
            })}
          >
            <button
              className={css({
                background: "#666",
                fontSize: "1.2em",
                cursor: "pointer",
                padding: "15px",
                width: "max-content",
                color: "white",
                margin: "auto",
                ":hover": {
                  backgroundColor: "#404040"
                }
              })}
              onClick={() => window.location.replace("/api/login")}
            >
              <GhLogo
                className={css({
                  height: "32px",
                  width: "32px",
                  verticalAlign: "middle",
                  path: {
                    fill: "white"
                  }
                })}
              />
              <span
                className={css({
                  padding: "0 5px"
                })}
              >
                Login with github
              </span>
              <FontAwesomeIcon
                className={css({
                  padding: "0 5px"
                })}
                icon={faSignInAlt}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
