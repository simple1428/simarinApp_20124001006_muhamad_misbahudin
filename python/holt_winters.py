import sys
import json
import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing

try:
    # membaca input dari Laravel
    input_data = sys.stdin.read()
    data = json.loads(input_data)

    df = pd.DataFrame(data)

    if len(df) < 24:
        raise Exception("Data minimal 24 bulan")

    # format tanggal
    df['tanggal'] = pd.to_datetime(df['tanggal'])
    df = df.sort_values('tanggal')
    df = df.set_index('tanggal')

    series = df['total_penumpang']

    # Holt-Winters terbaik berdasarkan pengujian (Additive)
    model = ExponentialSmoothing(
        series,
        trend='add',
        seasonal='add',
        seasonal_periods=12
    )

    fit = model.fit()

    forecast = fit.forecast(6)
    forecast_list = []
    for dt, val in forecast.items():
        forecast_list.append({
            "date": dt.strftime('%Y-%m'),
            "bulan": int(dt.month),
            "tahun": int(dt.year),
            "nilai": round(float(val), 2)
        })

    fitted_values = {}
    for dt, val in fit.fittedvalues.items():
        key = dt.strftime('%Y-%m')
        fitted_values[key] = round(float(val), 2)

    # In-sample error calculations
    errors = series - fit.fittedvalues
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    mape = float(np.mean(np.abs(errors / series)) * 100)

    result = {
        "forecast": round(float(forecast.iloc[0]), 2),       # Step 1 (Bulan ini: September 2026)
        "forecast_next": round(float(forecast.iloc[1]), 2),  # Step 2 (Bulan depan: Oktober 2026)
        "forecast_list": forecast_list,                      # 6-Month projections
        "fitted": fitted_values,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({
        "error": str(e)
    }))