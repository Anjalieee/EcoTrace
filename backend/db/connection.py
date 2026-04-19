import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """Create and return a MySQL database connection."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ecotrace")
    )

def query_one(sql, params=None):
    """Execute a query and return single row."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        result = cursor.fetchone()
        return result
    finally:
        cursor.close()
        conn.close()

def query_all(sql, params=None):
    """Execute a query and return all rows."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        if params:
            cursor.execute(sql, params)
        else:
            cursor.execute(sql)
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        conn.close()

def execute_insert_update(sql, params):
    """Execute INSERT or UPDATE and return last row id or rows affected."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        conn.commit()
        return cursor.lastrowid if cursor.lastrowid else cursor.rowcount
    finally:
        cursor.close()
        conn.close()
