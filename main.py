from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Sirf CSV file upload karein!")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        total_rows, total_cols = df.shape
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

        # Category Counts
        category_breakdown = {}
        for col in categorical_cols:
            counts = df[col].value_counts().to_dict()
            category_breakdown[col] = [{"name": str(k), "count": int(v)} for k, v in counts.items()]

        # Group By Aggregations (Average value per category)
        aggregated_data = {}
        for cat_col in categorical_cols:
            aggregated_data[cat_col] = {}
            for num_col in numeric_cols:
                grouped = df.groupby(cat_col)[num_col].mean().reset_index()
                aggregated_data[cat_col][num_col] = [
                    {"x": str(row[cat_col]), "y": round(float(row[num_col]), 2)}
                    for _, row in grouped.iterrows()
                ]

        # Histograms Data
        histograms = {}
        for col in numeric_cols:
            counts, bin_edges = np.histogram(df[col].dropna(), bins=8)
            histograms[col] = [
                {"x": f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}", "y": int(counts[i])}
                for i in range(len(counts))
            ]

        # Box stats
        box_stats = {}
        for col in numeric_cols:
            box_stats[col] = {
                "min": float(df[col].min()),
                "q1": float(df[col].quantile(0.25)),
                "median": float(df[col].median()),
                "q3": float(df[col].quantile(0.75)),
                "max": float(df[col].max())
            }

        # Raw records
        raw_records = df.fillna("N/A").to_dict(orient="records")

        return {
            "filename": file.filename,
            "total_rows": total_rows,
            "total_cols": total_cols,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "category_breakdown": category_breakdown,
            "aggregated_data": aggregated_data,
            "histograms": histograms,
            "box_stats": box_stats,
            "preview": raw_records[:15],
            "full_data": raw_records
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")