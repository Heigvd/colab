/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author maxence
 */
public class DatabaseTools {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseTools.class);

    /** Utiliy class */
    private DatabaseTools() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * delete all records from database
     *
     * @param datasource ds to clear
     */
    public static void clearDatabase(DataSource datasource) {
        String sql = "DO\n"
            + "$func$\n"
            + "BEGIN \n"
            + "EXECUTE (\n"
            + "  SELECT 'TRUNCATE TABLE '\n"
            + "    || string_agg(quote_ident(schemaname) || '.' || quote_ident(tablename), ', ')\n"
            + "    || ' CASCADE'\n"
            + "  FROM   pg_tables\n"
            + "  WHERE  (schemaname = 'public'\n"
            + "          AND tablename <> 'sequence')\n"
            + ");\n"
            + "END\n"
            + "$func$;";

        try (Connection connection = datasource.getConnection();
             Statement st = connection.createStatement()) {
            st.execute(sql);
        } catch (SQLException ex) {
            logger.error("Table reset (SQL: " + sql + ")", ex);
        }
    }

    public static int getMissingIndexesCount(DataSource datasource) throws SQLException {

        try (Connection connection = datasource.getConnection();
             Statement statement = connection.createStatement()) {
            String createExtension = "CREATE EXTENSION IF NOT EXISTS intarray;";
            statement.execute(createExtension);

            String query = ""
                + "SELECT tablename, array_to_string(column_name_list, ',') AS fields, pg_index.indexrelid::regclass, 'CREATE INDEX index_' || relname || '_' ||\n"
                + "         array_to_string(column_name_list, '_') || ' on ' || tablename ||\n"
                + "         ' (' || array_to_string(column_name_list, ',') || ') ' AS create_query\n"
                + "FROM (\n"
                + "SELECT DISTINCT\n" // selection all attributes form constraints
                + "       tablename,\n"
                + "       array_agg(attname) AS column_name_list,\n"
                + "       array_agg(attnum) AS column_list\n"
                + "     FROM pg_attribute\n"
                + "          JOIN (SELECT tablename,\n"
                + "                 conname,\n"
                + "                 unnest(conkey) AS column_index\n"
                + "                FROM (\n"
                + "                   SELECT DISTINCT\n" // select all contraints
                + "                        conrelid::regclass as tablename,\n"
                + "                        conname,\n"
                + "                        conkey\n"
                + "                      FROM pg_constraint\n"
                + "                        JOIN pg_class ON pg_class.oid = conrelid\n"
                + "                        JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace\n"
                + "                      WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'\n" // but internal ones
                + "                      ) fkey\n"
                + "               ) fkey\n"
                + "               ON fkey.tablename = pg_attribute.attrelid\n"
                + "                  AND fkey.column_index = pg_attribute.attnum\n"
                + "     GROUP BY tablename, conname\n"
                + "     ) AS candidate_index\n"
                + "JOIN pg_class ON pg_class.oid = candidate_index.tablename\n"
                + "LEFT JOIN pg_index ON pg_index.indrelid = tablename\n" // join indexes matching same attributes as the constraint
                + "                      AND array_to_string(sort(indkey), ' ') = array_to_string(sort(column_list), ' ')\n"
                + "WHERE indexrelid IS NULL;"; // finallay only keep contraints without indexes
            ResultSet resultSet = statement.executeQuery(query);
            int count = 0;

            StringBuilder msg = new StringBuilder("Missing index(es):");

            while (resultSet.next()) {
                msg.append(System.lineSeparator()).append("  - ");
                msg.append(resultSet.getString("tablename")).append(" / ").append(resultSet.getString("fields"));
                msg.append(": ").append(resultSet.getString("create_query"));
                count++;
            }
            if (count > 0) {
                logger.error(msg.toString());
            }
            return count;

        } catch (SQLException ex) {
            logger.error("Failed to count missing indexes", ex);
        }
        return -1;
    }

    /**
     * Update all sequences to have unpredicatable IDs
     *
     * @param datasource the ds
     *
     * @throws SQLException something went wrong
     */
    public static void randomizeSequences(DataSource datasource) throws SQLException {

        try (Connection connection = datasource.getConnection();
             Statement statement = connection.createStatement()) {
            String query = "SELECT "
                + "  setval(sequencename::regclass, "
                + "  (coalesce(last_value, 0) + ceil(random()*1000))::int, "
                + "  true) "
                + "FROM pg_sequences;";

            statement.execute(query);
            statement.executeQuery(query);
        } catch (SQLException ex) {
            logger.error("Failed to randomize sequences", ex);
        }
    }

}
