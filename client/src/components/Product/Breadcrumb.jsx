import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ category, subcategory, productName }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white">
            <Home size={16} />
          </Link>
          
          <ChevronRight size={16} className="mx-2" />
          
          <Link 
            to={`/category/${category}`} 
            className="hover:text-gray-900 dark:hover:text-white capitalize"
          >
            {category}
          </Link>
          
          {subcategory && (
            <>
              <ChevronRight size={16} className="mx-2" />
              <Link 
                to={`/category/${category}/${subcategory}`} 
                className="hover:text-gray-900 dark:hover:text-white capitalize"
              >
                {subcategory}
              </Link>
            </>
          )}
          
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-[300px]">
            {productName}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;