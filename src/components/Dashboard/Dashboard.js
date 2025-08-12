import React, { useState, useEffect, useCallback } from 'react';
import { Layout, message, Form } from 'antd';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import TranslationContent from './TranslationContent/TranslationContent';
import UnifiedFooter from '../UnifiedFooter/UnifiedFooter';
import { getMessage } from '../../locales';
import './Dashboard.css';

const { Content } = Layout;

const Dashboard = () => {
  const { locale, changeLanguage } = useLanguage();
  
  // 基础状态
  const [translations, setTranslations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [languageNames, setLanguageNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [databases, setDatabases] = useState([]);
  const [currentDatabase, setCurrentDatabase] = useState('');
  const [isDatabaseModalVisible, setIsDatabaseModalVisible] = useState(false);
  const [databaseForm] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentTag, setCurrentTag] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [editingTag] = useState(null);
  const [tagForm] = Form.useForm();
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // 语言管理相关状态
  const [languageForm] = Form.useForm();
  
  // 展开面板状态
  const [isLanguagePanelVisible, setIsLanguagePanelVisible] = useState(false);
  const [isTagPanelVisible, setIsTagPanelVisible] = useState(false);
  const [isLogPanelVisible, setIsLogPanelVisible] = useState(false);

  // 数据获取函数 - 简化版本
  const fetchLanguages = useCallback(async () => {
    try {
      const response = await axios.get('/api/languages');
      if (response.data.success) {
        setLanguages(response.data.languages);
        setLanguageNames(response.data.language_names);
      }
    } catch (error) {
      message.error(getMessage('getLanguagesFailed', locale));
    }
  }, [locale]);

  const fetchTranslations = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (currentTag && currentTag !== 'all') {
        params.append('tag', currentTag);
      }
      if (selectedLanguage) {
        params.append('language', selectedLanguage);
      }
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      
      const response = await axios.get(`/api/translations?${params.toString()}`);
      if (response.data.success) {
        const { translations: newTranslations, pagination } = response.data;
        
        if (append) {
          setTranslations(prev => [...prev, ...newTranslations]);
        } else {
          setTranslations(newTranslations);
        }
        
        setCurrentPage(pagination.page);
        setTotalCount(pagination.total);
        setHasMore(pagination.has_more);
      }
    } catch (error) {
      message.error(getMessage('getTranslationsFailed', locale));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentTag, selectedLanguage, pageSize, locale]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get('/api/tags');
      if (response.data.success) {
        setTags(response.data.tags);
      }
    } catch (error) {
      message.error(getMessage('getTagsFailed', locale));
    }
  }, [locale]);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get('/api/logs?limit=10');
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      message.error(getMessage('getLogsFailed', locale));
    }
  }, [locale]);

  const fetchDatabases = useCallback(async () => {
    try {
      const response = await axios.get('/api/databases');
      if (response.data.success) {
        console.log('Databases response:', response.data);
        setDatabases(response.data.databases);
        // 设置默认数据库：优先使用后端返回的当前数据库，否则使用第一个数据库
        if (!currentDatabase) {
          const defaultDb = response.data.current_database || response.data.databases[0];
          console.log('Setting default database:', defaultDb);
          if (defaultDb) {
            setCurrentDatabase(defaultDb);
          }
        }
      }
    } catch (error) {
      message.error(getMessage('getDatabasesFailed', locale));
    }
  }, [locale, currentDatabase]);

  // 初始化基础数据
  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      // 并行获取所有基础数据
      await Promise.all([
        fetchDatabases(),
        fetchLanguages(),
        fetchTags(),
        fetchLogs()
      ]);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchDatabases, fetchLanguages, fetchTags, fetchLogs]);

  // 组件挂载时初始化基础数据
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 当数据库或筛选条件变化时重新获取翻译数据
  useEffect(() => {
    if (currentDatabase) {
      fetchTranslations(1, false);
    }
  }, [currentDatabase, currentTag, selectedLanguage, fetchTranslations]);

  // 加载更多数据
  const loadMoreTranslations = async () => {
    if (hasMore && !loadingMore) {
      await fetchTranslations(currentPage + 1, true);
    }
  };

  // 事件处理函数
  const handleCreateTag = () => {
    setIsTagPanelVisible(true);
  };

  const handleAddTag = async (tagName) => {
    try {
      if (tags.includes(tagName)) {
        message.warning(getMessage('tagExists', locale));
        return;
      }

      await axios.post('/api/tags', { name: tagName });
      message.success(getMessage('tagCreated', locale));
      
      await Promise.all([fetchTags(), fetchLogs()]);
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error(getMessage('operationFailed', locale));
      }
    }
  };

  const handleDeleteTag = async (tagName) => {
    try {
      const infoResponse = await axios.get(`/api/tags/${tagName}/info`);
      if (infoResponse.data.success) {
        const { translation_count } = infoResponse.data;
        
        return {
          tagName,
          translation_count,
          onConfirm: async () => {
            try {
              await axios.delete(`/api/tags/${tagName}`);
              message.success(getMessage('tagDeleted', locale));
              
              if (currentTag === tagName) {
                setCurrentTag('all');
              }
              
              await Promise.all([fetchTags(), fetchTranslations(), fetchLogs()]);
            } catch (error) {
              message.error(getMessage('operationFailed', locale));
            }
          }
        };
      }
    } catch (error) {
      message.error(getMessage('operationFailed', locale));
    }
  };

  const handleTagModalOk = async () => {
    try {
      const values = await tagForm.validateFields();
      const { name } = values;

      await axios.post('/api/tags', { name });
      message.success(getMessage('tagCreated', locale));

      setIsTagModalVisible(false);
      await Promise.all([fetchTags(), fetchLogs()]);
    } catch (error) {
      message.error(getMessage('operationFailed', locale));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await fetchTranslations(1, false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      if (currentTag && currentTag !== 'all') {
        params.append('tag', currentTag);
      }
      if (selectedLanguage) {
        params.append('language', selectedLanguage);
      }
      
      const response = await axios.get(`/api/search?${params.toString()}`);
      if (response.data.success) {
        setTranslations(response.data.translations);
      }
    } catch (error) {
      message.error(getMessage('searchFailed', locale));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTranslation = () => {
    setEditingTranslation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditTranslation = (record) => {
    setEditingTranslation(record);
    
    const tag = record.tags && record.tags.length > 0 ? record.tags[0] : '';
    
    form.setFieldsValue({
      english: record.english,
      key: record.key || '',
      tag: tag,
      ...record.translations
    });
    setIsModalVisible(true);
  };

  const handleDeleteTranslation = async (englishId) => {
    try {
      await axios.delete(`/api/translations/${englishId}`);
      message.success(getMessage('deleteSuccess', locale));
      await Promise.all([fetchTranslations(), fetchLogs()]);
    } catch (error) {
      message.error(getMessage('deleteFailed', locale));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { english, key, tag, ...translations } = values;

      if (editingTranslation) {
        await axios.put(`/api/translations/${editingTranslation.english_id}`, {
          english,
          key,
          tag: tag || '',
          translations
        });
        message.success(getMessage('updateSuccess', locale));
      } else {
        await axios.post('/api/translations', {
          english,
          key,
          tag: tag || '',
          translations
        });
        message.success(getMessage('addSuccess', locale));
      }

      setIsModalVisible(false);
      await Promise.all([fetchTranslations(), fetchTags(), fetchLogs()]);
    } catch (error) {
      message.error(getMessage('operationFailed', locale));
    }
  };

  const handleExport = async () => {
    // 显示语言选择对话框
    const { Modal, Select } = await import('antd');
    Modal.confirm({
      title: getMessage('exportLanguage', locale),
      content: (
        <div>
          <p>{getMessage('selectLanguage', locale)}:</p>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder={getMessage('selectLanguage', locale)}
            onChange={(value) => {
              Modal.destroyAll();
              exportLanguageData(value);
            }}
          >
            <Select.Option value="all">{getMessage('exportAllLanguages', locale)}</Select.Option>
            {languages.map(lang => (
              <Select.Option key={lang} value={lang}>
                {getBilingualLanguageName(lang)}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      onCancel: () => {
        Modal.destroyAll();
      },
      okText: getMessage('confirm', locale),
      cancelText: getMessage('cancel', locale),
      showCancel: true
    });
  };

  const exportLanguageData = async (language) => {
    try {
      if (language === 'all') {
        const exportPromises = languages.map(async (lang) => {
          try {
            const response = await axios.get(`/api/export/${lang}`);
            if (response.data.success) {
              const dataStr = JSON.stringify(response.data.data, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${currentDatabase.replace('.db', '')}_${lang}.json`;
              link.click();
              URL.revokeObjectURL(url);
              
              return { lang, success: true, stats: response.data.stats };
            }
          } catch (error) {
            return { lang, success: false, error: error.message };
          }
        });

        const results = await Promise.all(exportPromises);
        const successfulExports = results.filter(r => r.success);
        const failedExports = results.filter(r => !r.success);

        if (successfulExports.length > 0) {
          const totalExported = successfulExports.reduce((sum, r) => sum + r.stats.exported, 0);
          const totalRecords = successfulExports.reduce((sum, r) => sum + r.stats.total, 0);
          const totalWithKey = successfulExports.reduce((sum, r) => sum + r.stats.with_key, 0);
          
          message.success(getMessage('exportAllSuccess', locale, {
            languageCount: successfulExports.length,
            exportedCount: totalExported,
            totalCount: totalRecords,
            keyCount: totalWithKey
          }));
        }

        if (failedExports.length > 0) {
          const failedLangs = failedExports.map(r => getBilingualLanguageName(r.lang)).join('、');
          message.warning(getMessage('exportPartialFailed', locale, { failedLangs }));
        }
      } else {
        const response = await axios.get(`/api/export/${language}`);
        if (response.data.success) {
          const dataStr = JSON.stringify(response.data.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentDatabase.replace('.db', '')}_${language}.json`;
          link.click();
          URL.revokeObjectURL(url);
          
          const langName = getBilingualLanguageName(language);
          message.success(getMessage('exportSingleSuccess', locale, {
            language: langName
          }));
        }
      }
    } catch (error) {
      message.error(getMessage('exportFailed', locale));
    }
  };

  const handleCreateDatabase = async () => {
    try {
      const values = await databaseForm.validateFields();
      const response = await axios.post('/api/databases', {
        name: values.databaseName
      });
      
      if (response.data.success) {
        message.success(response.data.message);
        setIsDatabaseModalVisible(false);
        databaseForm.resetFields();
        await fetchDatabases();
      }
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error(getMessage('createDatabaseFailed', locale));
      }
    }
  };

  const handleSwitchDatabase = async (dbName) => {
    try {
      const response = await axios.post('/api/databases/switch', {
        name: dbName
      });
      
      if (response.data.success) {
        message.success(response.data.message);
        
        setCurrentTag('all');
        setSelectedLanguage(null);
        setActiveTab('all');
        setSearchQuery('');
        
        setCurrentDatabase(dbName);
      }
    } catch (error) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error(getMessage('switchDatabaseFailed', locale));
      }
    }
  };

  const handleRemoveLanguage = async (language) => {
    try {
      const response = await axios.post('/api/languages/remove', { language });
      if (response.data.success) {
        message.success(getMessage('languageRemoved', locale));
        await fetchLanguages();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(getMessage('removeLanguageFailed', locale));
    }
  };

  const handleToggleLanguage = async (language, active) => {
    try {
      const response = await axios.post('/api/languages/toggle', { language, active });
      if (response.data.success) {
        message.success(response.data.message);
        await fetchLanguages();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error(getMessage('toggleLanguageFailed', locale));
    }
  };

  const handleCreateLanguage = () => {
    setIsLanguagePanelVisible(true);
  };

  const handleShowLogs = () => {
    setIsLogPanelVisible(true);
  };

  const handleLocaleChange = (newLocale) => {
    changeLanguage(newLocale);
  };

  // 获取双语语言名称
  const getBilingualLanguageName = (langCode) => {
    const languageNameMap = {
      'english': { zh: '英文', en: 'English' },
      'chinese': { zh: '中文', en: 'Chinese' },
      'thai': { zh: '泰语', en: 'Thai' },
      'czech': { zh: '捷克语', en: 'Czech' },
      'slovak': { zh: '斯洛伐克语', en: 'Slovak' },
      'italian': { zh: '意大利语', en: 'Italian' },
      'polish': { zh: '波兰语', en: 'Polish' },
      'latin': { zh: '拉丁语', en: 'Latin' },
      'dutch': { zh: '荷兰语', en: 'Dutch' },
      'portuguese': { zh: '葡萄牙语', en: 'Portuguese' },
      'greek': { zh: '希腊语', en: 'Greek' },
      'balkan': { zh: '巴尔干语', en: 'Balkan' },
      'bulgarian': { zh: '保加利亚语', en: 'Bulgarian' },
      'turkish': { zh: '土耳其语', en: 'Turkish' },
      'french': { zh: '法语', en: 'French' },
      'german': { zh: '德语', en: 'German' },
      'ukrainian': { zh: '乌克兰语', en: 'Ukrainian' },
      'russian': { zh: '俄语', en: 'Russian' },
      'south_african': { zh: '南非语', en: 'South African' },
      'arabic': { zh: '阿拉伯语', en: 'Arabic' },
      'norwegian': { zh: '挪威语', en: 'Norwegian' },
      'finnish': { zh: '芬兰语', en: 'Finnish' },
      'macedonian': { zh: '马其顿语', en: 'Macedonian' },
      'estonian': { zh: '爱沙尼亚语', en: 'Estonian' },
      'slovenian': { zh: '斯洛文尼亚语', en: 'Slovenian' },
      'indonesian': { zh: '印尼语', en: 'Indonesian' },
      'swedish': { zh: '瑞典语', en: 'Swedish' },
      'japanese': { zh: '日语', en: 'Japanese' },
      'korean': { zh: '韩语', en: 'Korean' }
    };
    
    const langNames = languageNameMap[langCode];
    if (langNames) {
      return langNames[locale] || langNames.zh;
    }
    
    return langCode;
  };

  return (
    <Layout className="app-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Content className="content-wrapper" style={{ 
        flex: 1,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <TranslationContent
          // 状态
          translations={translations}
          languages={languages}
          loading={loading}
          searchQuery={searchQuery}
          isModalVisible={isModalVisible}
          editingTranslation={editingTranslation}
          isDatabaseModalVisible={isDatabaseModalVisible}
          activeTab={activeTab}
          
          // 标签相关
          tags={tags}
          currentTag={currentTag}
          selectedLanguage={selectedLanguage}
          isTagModalVisible={isTagModalVisible}
          tagForm={tagForm}
          
          // 日志相关
          logs={logs}
          
          // 数据库相关
          currentDatabase={currentDatabase}
          databases={databases}
          onSwitchDatabase={handleSwitchDatabase}
          onCreateDatabase={() => setIsDatabaseModalVisible(true)}
          
          // 语言管理相关
          isLanguagePanelVisible={isLanguagePanelVisible}
          isTagPanelVisible={isTagPanelVisible}
          isLogPanelVisible={isLogPanelVisible}
          
          // 表单
          form={form}
          databaseForm={databaseForm}
          
          // 事件处理
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          setActiveTab={setActiveTab}
          setCurrentTag={setCurrentTag}
          setSelectedLanguage={setSelectedLanguage}
          handleAddTranslation={handleAddTranslation}
          handleEditTranslation={handleEditTranslation}
          handleDeleteTranslation={handleDeleteTranslation}
          handleModalOk={handleModalOk}
          handleCreateTag={handleCreateTag}
          handleDeleteTag={handleDeleteTag}
          handleTagModalOk={handleTagModalOk}
          setIsTagModalVisible={setIsTagModalVisible}
          handleExport={handleExport}
          exportLanguageData={exportLanguageData}
          handleCreateDatabase={handleCreateDatabase}
          setIsModalVisible={setIsModalVisible}
          setIsDatabaseModalVisible={setIsDatabaseModalVisible}
          handleRemoveLanguage={handleRemoveLanguage}
          handleToggleLanguage={handleToggleLanguage}
          handleCreateLanguage={handleCreateLanguage}
          handleAddTag={handleAddTag}
          handleShowLogs={handleShowLogs}
          setIsLanguagePanelVisible={setIsLanguagePanelVisible}
          setIsTagPanelVisible={setIsTagPanelVisible}
          setIsLogPanelVisible={setIsLogPanelVisible}
          
          // 分页相关
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMoreTranslations}
          totalCount={totalCount}
          
          // 国际化
          getBilingualLanguageName={getBilingualLanguageName}
        />
      </Content>
      <UnifiedFooter 
        onLocaleChange={handleLocaleChange}
      />
    </Layout>
  );
};

export default Dashboard;
