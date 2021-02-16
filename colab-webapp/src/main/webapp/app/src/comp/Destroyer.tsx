/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes, faCheck, faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import {iconStyle} from "./style";

export function Destroyer({onDelete}: {onDelete: () => void}) {
  const [waitDeleteConfirm, setConfirm] = React.useState(false);

  return (
    <div>
      {waitDeleteConfirm ? (
        <div>
          <FontAwesomeIcon
            className={iconStyle}
            icon={faTimes}
            onClick={() => setConfirm(false)}
          />
          <FontAwesomeIcon
            className={iconStyle}
            icon={faCheck}
            onClick={() => onDelete}
          />
        </div>
      ) : (
          <div>
            <FontAwesomeIcon
              className={iconStyle}
              icon={faTrashAlt}
              onClick={() => setConfirm(true)}
            />
          </div>
        )}
    </div>
  );
}
