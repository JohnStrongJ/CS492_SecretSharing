
// Calculates the y value given an x value and a polynomial
function calculateY(x, p) {
    let y = 0;
    let xN = 1;

    p.forEach(coeff => {
        y = y + coeff * xN;
        xN = xN * x;
    }); // end for each

    return y;
}

// Generates the keys to be shared.
function generateParts() {

    // Get the form inputs
    let secret = document.getElementById('secretInput').value;
    let numParts = document.getElementById('partFormInput').value;
    let numCoop = document.getElementById('coopFormInput').value;

    // Create arrays. One representing the polynomial and one containing the parts
    let polynomial = Array.apply(null, Array(numCoop - 1));
    let participantKeys = Array.apply(null, Array(numParts));

    // y-intercept is the secret
    polynomial[0] = secret;

    // Generate random nonzero coefficients for polynomial of degree = numCoop-1
    for (let i = 1; i < numCoop; i++) {
        let tempCoeff = 0;
        while (tempCoeff === 0) {
            tempCoeff = Math.floor(Math.random() * 601);
        }
        polynomial[i] = tempCoeff;
    }

    // Generate points, these are the keys
    for (let j = 1; j <= numParts; j++) {
        let x = j;
        let y = calculateY(x, polynomial);
        let point = [x, y];
        participantKeys[j-1] = point;
    }

    // Create text file of parts and download it to the user's PC so they can share them.
    let keysString = participantKeys.join('\n');
    let keysFile = new File([keysString], "keys.txt", {
          type: "text/plain",
    });

    let url = URL.createObjectURL(keysFile);
    chrome.downloads.download({
      url: url,
      filename: "keys.txt",
      saveAs: true
    });
}

// Calculate the secret
function calculateSecret() {

    // Get the form input of parts
    let keys = document.getElementById('parts').value.split('\n');

    let numPoints = keys.length;
    // initialize array for the points the user inputs
    let points = Array.apply(null, Array(numPoints));

    // initialize secret
    let secret = 0;

    // assign appropriate point values to the points array
    keys.forEach((key, i) => {
        let point = key.split(',');
        points[i] = point;
    }); // end for each

    // LaGrange method for finding polynomial given a set of points
    // We only need the y intercept, so we do not worry about finding the entire polynomial
    for (let i = 0; i < numPoints; i++) {
        // y_i
        let l = points[i][1];

        for (let j = 0; j < numPoints; j++) {
            if (i != j) {
                // x_j and x_i
                let xFrac = -points[j][0] / (points[i][0] - points[j][0]);
                l = l * xFrac;
            }
        }
        secret = secret + l;
    }

    // put the value in the form so the user can see it
    let secretField = document.getElementById('secretOutput');
    secretField.value = Math.trunc(secret); // Math.trunc removes any fractional component that may be on our input
}

// Add functionality to buttons. Validates the form inputs before calling the appropriate functions.
function setListeners() {
    let generateBtn = document.getElementById('submitBtn');
    generateBtn.addEventListener('click', () => {
        let partsIn = document.getElementById('partFormInput').value;
        let coopIn = document.getElementById('coopFormInput').value;
        if (document.getElementById('form').checkValidity() && coopIn <= partsIn) {
            generateParts();
        }
    });

    let calculateBtn = document.getElementById('submitBtn2');
    calculateBtn.addEventListener('click', () => {
        if (document.getElementById('form2').checkValidity()) {
            calculateSecret();
        }
    });
}

document.addEventListener('DOMContentLoaded', setListeners);
