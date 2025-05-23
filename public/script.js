function getProgressColor(percentage) {
  const red = Math.min(255, Math.floor((percentage / 100) * 255));
  const green = Math.max(0, 255 - red);
  return `rgb(${red}, ${green}, 0)`;
}

function startCountdown(endTime, element) {
  function update() {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance < 0) {
      element.textContent = "Expired";
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    element.textContent = `Time Left: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  update();
  const interval = setInterval(update, 1000);
}

async function checkData() {
  const iccid = document.getElementById("iccid").value.trim();
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = ""; // Clear previous results

  if (!iccid) {
    resultDiv.innerHTML = '<p style="color:red;">Please enter ICCID.</p>';
    return;
  }

  try {
    const response = await fetch(`https://api.esim-go.com/v2.4/esims/${iccid}/bundles`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'WASne7TcbZ9qtrjhfxEe2VEDwlhbsGgBFSDJkmul' // ضع هنا مفتاحك الصحيح
      }
    });

    if (!response.ok) throw new Error("Failed to fetch data");

    const data = await response.json();
    const bundles = data.bundles || [];

    if (bundles.length === 0) {
      resultDiv.innerHTML = '<p style="color:red;">No data found for this ICCID.</p>';
      return;
    }

    const countdownItems = [];

    bundles.forEach((bundle, index) => {
      const assignment = bundle.assignments?.[0];
      if (!assignment) return;

      const initial = assignment.initialQuantity;
      const remaining = assignment.remainingQuantity;
      const usedBytes = initial - remaining;

      const initialMB = initial / 1_000_000;
      const remainingMB = remaining / 1_000_000;
      const usedMB = usedBytes / 1_000_000;

      const totalGB = (initialMB / 1000).toFixed(3);
      const remainingGB = (remainingMB / 1000).toFixed(3);
      const usedGB = (usedMB / 1000).toFixed(3);
      const percentage = ((usedMB / initialMB) * 100).toFixed(1);

      const endDate = new Date(assignment.endTime);
      const expiryFormatted = `${endDate.getDate().toString().padStart(2, '0')}/${
        (endDate.getMonth() + 1).toString().padStart(2, '0')
      }/${endDate.getFullYear()} ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const barColor = getProgressColor(percentage);

      const cardId = `countdown-${index}`;

      resultDiv.innerHTML += `
        <div style="background:#f9f9f9; padding:20px; border-radius:10px; border:1px solid #ddd; margin-top: 20px;">
          <p><strong>ICCID:</strong> ${iccid}</p>
          <p><strong>Bundle:</strong> ${bundle.description}</p>
          <p><strong>Data Usage:</strong> ${usedGB} GB</p>
          <div class="progress-bar">
            <div class="progress-bar-fill" style="width:${percentage}%; background-color:${barColor};"></div>
          </div>
          <p><strong>Data Balance:</strong> ${remainingGB} GB</p>
          <p><strong>Expiry Date:</strong> ${expiryFormatted}</p>
          <p class="countdown" id="${cardId}"></p>
        </div>
      `;

      countdownItems.push({ endTime: endDate.getTime(), id: cardId });
    });

    countdownItems.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        startCountdown(item.endTime, el);
      }
    });

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<p style="color:red;">Error fetching data</p>';
  }
}
