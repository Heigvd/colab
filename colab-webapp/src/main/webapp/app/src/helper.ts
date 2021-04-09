import {User} from "colab-rest-client";

/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export const getDisplayName = (user: User) => {
  return user.commonname || `${user.firstname ||''} ${user.lastname || ''}`.trim() || user.username;
};

