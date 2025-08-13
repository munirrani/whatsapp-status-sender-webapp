import React, { useEffect, useState, useRef } from 'react';
import { SiNotion } from 'react-icons/si'; // Add this import
import { MdImage, MdAttachFile, MdClear, MdSend } from 'react-icons/md'; // Material Design Icon
import type { CSSProperties } from 'react'; // Import CSSProperties type
type TextAlign = CSSProperties['textAlign']; // Extract TextAlign type

interface FileInfo {
  uri: string; // For web, this will be a Blob URL or Data URL
  mimeType: string;
  name: string;
  size?: number;
  fileObject?: File; // Store the actual File object for FormData
}

function ifTextHas10NewlineEscapeChars(text: string) {
  const newLineEscapeChar = '\n';
  const newLineEscapeCharCount = (text.match(new RegExp(newLineEscapeChar, 'g')) || []).length;
  return newLineEscapeCharCount > 10;
}

function ifTextFull(text: string) {
  return text.length > 710 || ifTextHas10NewlineEscapeChars(text);
}

// Use proxy in development, direct URL in production
const endpoint: string = import.meta.env.DEV ? '/api' : 'https://your-backend-api.com';

const TypeStatus = () => {
  const [text, setText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [align, setAlign] = useState<TextAlign>('center');
  const [isTextFull, setTextFull] = useState<boolean>(false);
  const [textCount, setTextCount] = useState<number>(0);
  const [file, setFile] = useState<FileInfo | null>(null);
  const [recipientListFixed, setRecipientListFixed] = useState<Array<{ name: string; id?: number }>>([]);
  const [selectedRecipientGroup, setSelectedRecipientGroup] = useState<Array<Number>>([]);
  const [showProgressDialogSendingStatus, setShowProgressDialogSendingStatus] = useState<boolean>(false);
  const [showProgressDialogFetchingStatus, setShowProgressDialogFetchingStatus] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getList(): Promise<void> {
      const url: string = endpoint + '/list';

      try {
        console.log("Fetching recipient list from:", url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'X-API-Key': import.meta.env.VITE_EXPO_PUBLIC_BAILEY_API_KEY,
          },
        });
        const responseData = await response.json();
        setRecipientListFixed(responseData.list);
      } catch (error) {
        console.error("Error fetching recipient list:", error);
        alert("Error fetching recipient list");
      }
    }
    getList();
  }, []);

  useEffect(() => {
    setTextCount(text.length);
    setTextFull(ifTextFull(text));
    const size = Math.floor(32 - (text.length / 50));
    setFontSize(size < 16 ? 16 : size);
    setAlign(text.length < 150 ? 'center' : 'left');
  }, [text]);

  const sendStatusText = async (): Promise<void> => {
    if (!text || text.trim() === '') {
      alert("Text is empty");
      return;
    }
    if (selectedRecipientGroup.length === 0) {
      alert("Please select at least a group")
      return;
    }
    let url: string = endpoint + '/text';
    try {
      setShowProgressDialogSendingStatus(true);
      const data = {
        message: text,
        backgroundColor: '#212121',
        selectedRecipientGroup: selectedRecipientGroup,
      }
      console.log("Sending data: ", data);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'e_platform': 'web', // Changed platform
          'X-API-Key': import.meta.env.VITE_EXPO_PUBLIC_BAILEY_API_KEY,
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === 'Status sent successfully') {
        alert("Status sent!"); // Replaced ToastAndroid
        setText('');
        setShowProgressDialogSendingStatus(false);
      } else {
        alert(`Error: ${responseData.status || response.statusText || 'Unknown error'}`);
        setShowProgressDialogSendingStatus(false);
      }
    } catch (error) {
      console.error(error);
      setShowProgressDialogSendingStatus(false);
      alert("Error sending status"); // Replaced ToastAndroid
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const uri = URL.createObjectURL(selectedFile); // Create a Blob URL
      setFile({
        uri: uri,
        mimeType: selectedFile.type,
        name: selectedFile.name,
        size: selectedFile.size,
        fileObject: selectedFile, // Store the actual File object
      });
    }
  };

  // ...existing code...
  const renderFilePreview = (): React.ReactNode => {
    if (!file) return null;

    let iconComponent = null;

    if (file.mimeType.startsWith('image')) {
      iconComponent = <MdImage size={16} color="#000" style={{ marginRight: 5 }} />;
    } else if (file.mimeType.startsWith('video')) {
      iconComponent = <MdAttachFile size={16} color="#000" style={{ marginRight: 5 }} />; // Using MdAttachFile as a generic file icon for video/audio
    } else if (file.mimeType.startsWith('audio')) {
      iconComponent = <MdAttachFile size={16} color="#000" style={{ marginRight: 5 }} />; // Using MdAttachFile as a generic file icon for video/audio
    } else {
      iconComponent = <MdAttachFile size={16} color="#000" style={{ marginRight: 5 }} />; // Generic file icon for other types
    }

    const fullText = file.name;
    const truncatedText = fullText.length > 50 ? fullText.substring(0, 50) + '...' : fullText;

    return (
      <div style={{ backgroundColor: '#fff', padding: 10, margin: 10, borderRadius: 5 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}> {/* Changed justifyContent */}
          <div />
          <div style={{ display: 'flex', alignItems: 'center' }}> {/* Wrapper for icon and text */}
            {iconComponent}
            <p style={{ color: '#000', fontSize: 12, textAlign: 'center', margin: 0 }}>{truncatedText}</p>
          </div>
          <MdClear
            size={20} // Adjusted size slightly
            color="#000"
            style={{ cursor: 'pointer' }}
            onClick={clearFile} // Added click handler
            title="Clear file"
          />
        </div>
      </div>
    );
  }

  const clearFile = (): void => {
    if (file && file.uri.startsWith('blob:')) {
      URL.revokeObjectURL(file.uri); // Clean up Blob URL
    }
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  }

  const sendStatusMedia = async (): Promise<void> => {
    if (!file || !file.fileObject) {
      console.log('No file selected');
      alert('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file.fileObject); // Append the actual File object
    formData.append('message', text);
    formData.append('backgroundColor', '#212121');
    formData.append('selectedRecipientGroup', JSON.stringify(selectedRecipientGroup));

    let url: string = endpoint + '/media';

    try {
      setShowProgressDialogSendingStatus(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data' is automatically set by browser for FormData
          'Accept': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'e_platform': 'web', // Changed platform
          'X-API-Key': import.meta.env.VITE_EXPO_PUBLIC_BAILEY_API_KEY,
        },
        body: formData,
      });
      const responseData = await response.json();
      if (response.ok && responseData.status === 'Status sent successfully') {
        alert("Status sent!");
        setText('');
        clearFile(); // Use clearFile to also revoke Blob URL
        setShowProgressDialogSendingStatus(false);
      } else {
        alert(`Error: ${responseData.status || response.statusText || 'Unknown error'}`);
        setShowProgressDialogSendingStatus(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowProgressDialogSendingStatus(false);
      alert("Error sending status");
    }
  };

  const pushIndexToArray = (index: number): void => {
    if (!selectedRecipientGroup.includes(index)) {
      setSelectedRecipientGroup([...selectedRecipientGroup, index]);
    }
  }

  const removeIndexFromArray = (index: number): void => {
    setSelectedRecipientGroup(selectedRecipientGroup.filter((value) => value !== index));
  }

  // Handle viewport height changes for mobile keyboard
  useEffect(() => {
    const handleResize = () => {
      // Force layout recalculation when viewport changes
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);


  const fetchLatestStatus = async (): Promise<void> => {
    let url: string = endpoint + '/latest-status';
    try {
      setShowProgressDialogFetchingStatus(true);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'X-API-Key': import.meta.env.VITE_EXPO_PUBLIC_BAILEY_API_KEY,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        const newText = text + responseData.latestStatusText // append
        setText(newText);
        setTextCount(responseData.latestStatusText ? newText.length : text.length);
        setTextFull(ifTextFull(newText));
      }
      setShowProgressDialogFetchingStatus(false);
    } catch (error) {
      console.error("Error fetching latest status:", error);
      alert("Error fetching latest status");
      setShowProgressDialogFetchingStatus(false);
    }
  }

  return (
    <div style={styles.fullScreenContainer}>
      {/* Header equivalent */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Status Sender</h1>
        <div style={styles.headerRight}>
          <button
            style={{ ...styles.iconButton, marginRight: 15 }}
            onClick={fetchLatestStatus}
            title="Fetch Latest Status"
          >
            <SiNotion size={20} color="#fff" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*" // Allow all types as per original
          />
          <button
            style={styles.iconButton}
            onClick={() => fileInputRef.current?.click()} // Always attach file
            title={"Attach file"} // Updated title
          >
            <MdAttachFile size={20} color='#fff' /> {/* Always show attach icon */}
          </button>
        </div>
      </header>

      <div style={styles.container}>
        {renderFilePreview()}
        <textarea
          style={{ ...styles.textArea, fontSize: fontSize, textAlign: align }}
          placeholder="Type your status..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div style={styles.recipientScrollView}>
          {
            recipientListFixed.map((recipient, index) => {
              const currentId = recipient.id !== undefined ? recipient.id : index;
              const isSelected = selectedRecipientGroup.includes(currentId);
              return (
                <button
                  key={currentId}
                  style={{
                    backgroundColor: isSelected ? '#fff' : '#292929',
                    borderRadius: 50,
                    flexGrow: 1,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    isSelected ? removeIndexFromArray(currentId) : pushIndexToArray(currentId);
                  }}
                >
                  <span style={{
                    color: isSelected ? '#292929' : '#9c9c9c',
                    fontSize: 10,
                    padding: '5px 10px',
                    whiteSpace: 'nowrap', // Prevent text wrapping
                  }}>
                    {recipient.name}
                  </span>
                </button>
              );
            })
          }
        </div>

        <div style={styles.bottomContainer}>
          <div /> {/* Empty div for spacing */}
          <p style={{
            ...styles.textCount,
            color: isTextFull ? '#f54e4e' : '#555',
            fontWeight: isTextFull ? 'bold' : 'normal',
            padding: 5,
            marginLeft: 41,
          }}>
            {textCount}
          </p>
          <button
            onClick={!file ? sendStatusText : sendStatusMedia}
            style={styles.iconButton}
            title="Send Status"
          >
            <MdSend size={20} color="#fff" />
          </button>
        </div>

        {showProgressDialogSendingStatus && (
          <div style={styles.progressOverlay}>
            <div style={styles.progressDialog}>
              <div style={styles.spinner} />
              <p style={styles.progressMessage}>Sending status...</p>
            </div>
          </div>
        )}
        {showProgressDialogFetchingStatus && (
          <div style={styles.progressOverlay}>
            <div style={styles.progressDialog}>
              <div style={styles.spinner} />
              <p style={styles.progressMessage}>Appending latest status text...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline styles for simplicity
const styles: {
  fullScreenContainer: CSSProperties,
  header: CSSProperties,
  headerTitle: CSSProperties,
  headerRight: CSSProperties,
  headerSeparator: CSSProperties,
  iconButton: CSSProperties,
  selectedLocationButton: CSSProperties,
  unselectedLocationButton: CSSProperties,
  container: CSSProperties,
  textArea: CSSProperties,
  bottomContainer: CSSProperties,
  textCount: CSSProperties,
  recipientScrollView: CSSProperties,
  progressOverlay: CSSProperties,
  progressDialog: CSSProperties,
  spinner: CSSProperties,
  progressMessage: CSSProperties,
} = {
  fullScreenContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    height: 'calc(var(--vh, 1vh) * 100)',
    backgroundColor: '#212121',
    color: '#fff',
  },
  header: {
    backgroundColor: '#212121',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  headerSeparator: {
    width: '1px',
    height: '20px',
    backgroundColor: '#555',
    marginLeft: 15,
    marginRight: 10,
  },
  iconButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex', // To center icon if button has padding
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLocationButton: {
    backgroundColor: '#fff',
    padding: 7,
    borderRadius: 10,
    marginRight: 5,
  },
  unselectedLocationButton: {
    backgroundColor: '#212121',
    padding: 7,
    borderRadius: 10,
    marginRight: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#212121',
    display: 'flex',
    flexDirection: 'column' as 'column',
    padding: '10px',
  },
  textArea: {
    flex: 1,
    textAlign: 'center',
    fontSize: 32,
    fontFamily: 'inherit',
    alignContent: 'center',
    backgroundColor: 'transparent',
    outline: 'none',
    border: 'none',
    color: 'white',
    resize: 'none',
  },
  bottomContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0px 5px',
    marginTop: 'auto', // Push to bottom
  },
  textCount: {
    fontSize: 12,
    margin: 0,
  },
  recipientScrollView: {
    display: 'flex',
    flexDirection: 'row' as 'row',
    overflowX: 'auto',
    padding: '5px 0',
    gap: '5px',
    margin: '5px 0px',
    minHeight: '30px',
    scrollbarWidth: 'none', // Hide scrollbar for Firefox
    msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
  },
  // Progress Dialog styles
  progressOverlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  progressDialog: {
    backgroundColor: '#212121',
    borderRadius: 5,
    padding: 20,
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    minHeight: 100,
  },
  spinner: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    width: 40,
    height: 40,
    animation: 'spin 1s linear infinite',
    marginBottom: 10,
  },
  progressMessage: {
    fontSize: 16,
    color: '#fff',
    margin: 0,
  },
};

// Inject keyframes for spinner animation and hide scrollbar for webkit browsers
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .recipientScrollView::-webkit-scrollbar {
    display: none;
  }

  /* Prevent zoom on input focus for iOS */
  @media screen and (min-width: 768px) {
    textarea {
      font-size: 24px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default TypeStatus;
