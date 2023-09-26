/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

// @ts-nocheck
import mongoist from 'mongoist';
import mongojs from 'mongojs';
import logger from '../utils/logger.js';

export class MongoAdapter {
  location: string;
  collection: string;
  multipleCollections: boolean;
  db: any;

  constructor(
    location: string,
    { collection, multipleCollections }: { collection: string; multipleCollections: boolean },
  ) {
    this.location = location;
    this.collection = collection;
    this.multipleCollections = multipleCollections;
    this.db = null;
    this.open();
    this.ping();
  }

  /**
   * Open the connection to MongoDB instance.
   */
  open() {
    let mongojsDb;
    if (this.multipleCollections) {
      mongojsDb = mongojs(this.location);
    } else {
      mongojsDb = mongojs(this.location, [this.collection]);
    }
    this.db = mongoist(mongojsDb);
  }

  /**
   * Get the MongoDB collection name for any docName
   * @param {object} [opts]
   * @param {string} [opts.docName]
   * @returns {string} collectionName
   */
  _getCollectionName({ docName }: { docName: string }): string {
    if (this.multipleCollections) {
      return docName;
    } else {
      return this.collection;
    }
  }

  /**
   * Apply a $query and get one document from MongoDB.
   * @param {object} query
   * @returns {Promise<object>}
   */
  get(query: { docName: string }): Promise<object> {
    return this.db[this._getCollectionName(query)].findOne(query);
  }

  /**
   * Store one document in MongoDB.
   * @param {object} query
   * @param {object} values
   * @returns {Promise<object>} Stored document
   */
  put(query: { docName: any; version?: any }, values: { value: any }): Promise<object> {
    if (!query.docName || !query.version || !values.value) {
      throw new Error('Document and version must be provided');
    }

    // findAndModify with upsert:true should simulate leveldb put better
    return this.db[this._getCollectionName(query)].findAndModify({
      query,
      update: { ...query, ...values },
      upsert: true,
      new: true,
    });
  }

  /**
   * Removes all documents that fit the $query
   * @param {object} query
   * @returns {Promise<object>} Contains status of the operation
   */
  del(query: { docName: string }): Promise<object> {
    const bulk = this.db[this._getCollectionName(query)].initializeOrderedBulkOp();
    bulk.find(query).remove();
    return bulk.execute();
  }

  /**
   * Get all or at least $opts.limit documents that fit the $query.
   * @param {object} query
   * @param {object} [opts]
   * @param {number} [opts.limit]
   * @param {boolean} [opts.reverse]
   * @returns {Promise<Array<object>>}
   */
  readAsCursor(
    query: { docName: string },
    { limit, reverse }: { limit?: number; reverse?: boolean } = {},
  ): Promise<Array<object>> {
    let curs = this.db[this._getCollectionName(query)].findAsCursor(query);
    if (reverse) curs = curs.sort({ clock: -1 });
    if (limit) curs = curs.limit(limit);
    return curs.toArray();
  }

  /**
   * Close connection to MongoDB instance.
   */
  close() {
    this.db.close();
  }

  /**
   * Get all collection names stored on the MongoDB instance.
   * @returns {Promise<Array<string>>}
   */
  getCollectionNames(): Promise<Array<string>> {
    return this.db.getCollectionNames();
  }

  /**
   * Delete database
   */
  async flush() {
    await this.db.dropDatabase();
    await this.db.close();
  }

  /**
   * Delete collection
   * @param {string} collectionName
   */
  dropCollection(collectionName: string) {
    return this.db[collectionName].drop();
  }

  /**
   * Check if DB connection alive
   */
  async ping() {
    const result = await this.db.runCommand({ ping: 1 });
    if (result) {
      logger.info('[MongoAdapter]: MongoDB connected');
    }
  }
}
