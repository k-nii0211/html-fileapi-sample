if (window.File && window.FileReader && window.FileList && window.Blob) {
} else {
  alert('File APIs are not fully supported in this browser.');
}

var reader;
var progress = document.querySelector('.percent');

function abortRead() {
  reader.abort();
}

function errorHandler(event) {
  switch(event.target.error.code) {
    case event.target.error.NOT_FOUND_ERR:
      alert('File not found.');
      break;
    case event.target.error.NOT_READABLE_ERR:
      alert('File not readable.');
      break;
    case event.target.error.ABORT_ERR:
      break;
    default:
      alert('An error occurred reading this file.');
  }
}

function updateProgress(event) {
  if (event.lengthComputable) {
    var percentLoaded = Math.round((event.loaded / event.total) * 100);
    if (percentLoaded < 100) {
      progress.style.width = percentLoaded + '%';
      progress.textContent = percentLoaded + '%';
    }
  }
}

function handleFileSelect(event) {
  event.stopPropagation();
  event.preventDefault();

  var files = event.dataTransfer.files;

  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', encodeURI(f.name), '</strong> (',
      f.type || 'n/a', ') -', f.size, ' bytes, last modified: ',
      f.lastModifiedDate.toLocaleDateString(), '</li>'
    );

    var reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(event) {
      alert('File read cancelled');
    };
    reader.onloadstart = function(event) {
      progress.style.width = '0%';
      progress.textContent = '0%';
      document.getElementById('progress_bar').className = 'loading';
    };

    reader.onload = (function(theFile) {
      return function(e) {
        progress.style.width = '100%';
        progress.textContent = '100%';
        setTimeout("document.getElementById('progress_bar').className='';", 200);

        if (!theFile.type.match('image.*')) {
          return false;
        }
        var span = document.createElement('span');
        span.innerHTML = [
          '<img class="thumb" src="', e.target.result,
          '" title="', encodeURI(theFile.name),
          '"/>'
        ].join('');
        document.getElementById('list').insertBefore(span, null);
      };
    })(f);
    if (f.type.match('image.*')) {
      reader.readAsDataURL(f);
    } else {
      reader.readAsBinaryString(f);
    }
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(event) {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
